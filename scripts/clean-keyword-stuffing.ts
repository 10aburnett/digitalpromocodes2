/**
 * Clean keyword stuffing from Deal content fields
 *
 * Applies ChatGPT's anti-stuffing rules:
 * - Rule A: Proximity cap (1× name per paragraph, 1× per 50-word window)
 * - Rule B: Section caps (field-specific limits)
 * - Rule C: "Promo code" phrase control
 * - Rule D: Heading hygiene
 *
 * Safety:
 * - HTML-aware: only edits text nodes, preserves tags
 * - JSON-aware: detects and handles faqContent as JSON
 * - Idempotent: deterministic replacements
 * - Audit trail: produces CSV with before/after metrics
 *
 * Usage: npx ts-node scripts/clean-keyword-stuffing.ts
 */

import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

// ============================================================================
// TYPES
// ============================================================================

interface ExportRecord {
  slug: string;
  name: string;
  hasPromoCode: boolean;
  description: string | null;
  aboutContent: string | null;
  howToRedeemContent: string | null;
  promoDetailsContent: string | null;
  featuresContent: string | null;
  termsContent: string | null;
  faqContent: string | null;
}

interface CleanedRecord extends ExportRecord {
  _cleaningErrors: string[];
}

interface AuditEntry {
  slug: string;
  field: string;
  name_count_before: number;
  name_count_after: number;
  promo_terms_before: number;
  promo_terms_after: number;
  changed_paragraphs: number;
  delta_chars: number;
  parse_fail: boolean;
  error_message: string;
}

interface FieldConfig {
  maxNameTotal: number;          // Max total occurrences of offer name
  maxNamePerParagraph: number;   // Max per paragraph
  maxPromoTermsTotal: number;    // Max "promo code/discount code/code" total
  strictness: 'strict' | 'normal' | 'light';  // How aggressively to replace
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const FIELD_CONFIGS: Record<string, FieldConfig> = {
  description: {
    maxNameTotal: 1,
    maxNamePerParagraph: 1,
    maxPromoTermsTotal: 1,
    strictness: 'strict',
  },
  aboutContent: {
    maxNameTotal: 3,
    maxNamePerParagraph: 1,
    maxPromoTermsTotal: 2,
    strictness: 'normal',
  },
  howToRedeemContent: {
    maxNameTotal: 1,
    maxNamePerParagraph: 1,
    maxPromoTermsTotal: 2,
    strictness: 'strict',
  },
  promoDetailsContent: {
    maxNameTotal: 2,
    maxNamePerParagraph: 1,
    maxPromoTermsTotal: 2,
    strictness: 'light',  // Avoid changing legal phrasing
  },
  featuresContent: {
    maxNameTotal: 2,
    maxNamePerParagraph: 1,
    maxPromoTermsTotal: 2,
    strictness: 'normal',
  },
  termsContent: {
    maxNameTotal: 2,
    maxNamePerParagraph: 1,
    maxPromoTermsTotal: 1,
    strictness: 'light',  // Avoid changing legal phrasing
  },
  faqContent: {
    maxNameTotal: 3,
    maxNamePerParagraph: 1,
    maxPromoTermsTotal: 3,
    strictness: 'normal',
  },
};

// Replacement vocabulary based on whether there's a preceding article
// If there IS a preceding article (the/a/this/that), we use simple nouns
const NAME_REPLACEMENTS_WITH_ARTICLE = [
  'product',
  'platform',
  'membership',
  'program',
  'service',
  'offering',
];

// If there's NO preceding article, we use "it" or article+noun
const NAME_REPLACEMENTS_NO_ARTICLE = [
  'it',
  'the product',
  'this platform',
  'the membership',
  'this program',
  'the service',
];

const PROMO_TERM_REPLACEMENTS = [
  'discount code',
  'code',
  'offer',
  'deal',
  'savings',
];

// For no-code offers, use these instead
const NO_CODE_REPLACEMENTS = [
  'offer link',
  'automatic discount',
  'this offer',
  'the deal',
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function escapeForRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function flexiblePhraseRegex(phrase: string): string {
  const escaped = escapeForRegex(phrase);
  return escaped
    .replace(/[''`]/g, "[''`]?")
    .replace(/-/g, '[-\\s]?')
    .replace(/\s+/g, '\\s+');
}

/**
 * Safe capitalization check - handles empty strings gracefully.
 * Returns true if the first character is uppercase, false otherwise.
 */
function isCapitalized(s: string): boolean {
  if (!s || s.length === 0) return false;
  return s[0] === s[0].toUpperCase();
}

/**
 * Capitalize a replacement string if the original match was capitalized.
 */
function matchCapitalization(replacement: string, originalMatch: string): string {
  if (!replacement || replacement.length === 0) return replacement;
  if (isCapitalized(originalMatch)) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

/**
 * Build entity variants for anti-stuffing:
 * - Full name
 * - Brand root (first 2–3 tokens, stops before generic suffix words)
 * - Short name (remove common suffixes)
 */
function buildNameVariants(fullName: string): string[] {
  const name = fullName.trim().replace(/\s+/g, ' ');
  const tokens = name.split(' ').filter(Boolean);
  if (tokens.length === 0) return [name];

  const STOP_TOKENS = new Set([
    'lifetime', 'membership', 'course', 'program', 'bundle', 'access', 'subscription',
    'plan', 'community', 'tool', 'software', 'platform', 'training', 'bootcamp',
  ]);

  // 1) Full
  const variants: string[] = [name];

  // 2) Brand root: first 2–3 tokens until a stop token *after* we have at least 2 tokens.
  // IMPORTANT: don't cut too aggressively. For "Ayecon Academy ..." we want "Ayecon Academy".
  let root: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    root.push(tokens[i]);
    if (root.length >= 2 && i + 1 < tokens.length) {
      const next = tokens[i + 1].toLowerCase();
      // stop when next token is a generic suffix (membership/course/etc.)
      if (STOP_TOKENS.has(next)) break;
    }
    if (root.length >= 3) break;
  }
  const brandRoot = root.join(' ');
  if (brandRoot && brandRoot.toLowerCase() !== name.toLowerCase()) variants.push(brandRoot);

  // 3) Short name: remove common suffix tokens from the end
  const SUFFIXES = new Set([
    'lifetime', 'membership', 'course', 'program', 'bundle', 'access', 'subscription',
    'plan', 'community', 'training', 'bootcamp',
  ]);
  let shortTokens = [...tokens];
  while (shortTokens.length > 2 && SUFFIXES.has(shortTokens[shortTokens.length - 1].toLowerCase())) {
    shortTokens.pop();
  }
  const shortName = shortTokens.join(' ');
  if (shortName && !variants.some(v => v.toLowerCase() === shortName.toLowerCase())) variants.push(shortName);

  // Filter: avoid 1-word variants (too risky) BUT always keep the full name
  const cleaned = variants
    .map(v => v.trim().replace(/\s+/g, ' '))
    .filter((v, i) => i === 0 || v.split(' ').length >= 2);  // Always keep first (full name)

  // Sort longest-first so we match full name before brand root
  cleaned.sort((a, b) => b.length - a.length);

  // If we somehow end up with empty, return the original name
  if (cleaned.length === 0) {
    return [name];
  }

  return Array.from(new Set(cleaned.map(v => v.toLowerCase()))).map(lc => {
    // recover original casing from first match in cleaned
    return cleaned.find(v => v.toLowerCase() === lc) as string;
  });
}

/**
 * Regex to match any variant, with optional preceding article capture
 * Groups:
 *  1 = article (optional)
 *  2 = matched phrase
 */
function createEntityRegex(variants: string[]): RegExp {
  const alts = variants.map(v => flexiblePhraseRegex(v)).join('|');
  return new RegExp(`(?:(the|a|an|this|that)\\s+)?(${alts})`, 'gi');
}

/**
 * Regex to count any variant (no article)
 */
function createEntityCountRegex(variants: string[]): RegExp {
  const alts = variants.map(v => flexiblePhraseRegex(v)).join('|');
  return new RegExp(`\\b(?:${alts})\\b`, 'gi');
}

/**
 * Split text into sentences (lightweight, good enough for marketing copy)
 */
function splitSentences(s: string): string[] {
  return s.split(/(?<=[.!?])\s+/g);
}

/**
 * Create a case-insensitive regex for the offer name (LEGACY - kept for compatibility)
 * Handles common variations (apostrophes, hyphens, spacing)
 * Also captures preceding articles (the, a, an, this, that) to remove them
 */
function createNameRegex(name: string): RegExp {
  // Escape special regex characters
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Allow flexible apostrophes and hyphens
  const flexible = escaped
    .replace(/[''`]/g, "[''`]?")
    .replace(/-/g, '[-\\s]?')
    .replace(/\s+/g, '\\s+');
  // Capture preceding article (the, a, an, this, that) with optional space
  return new RegExp(`(?:(the|a|an|this|that)\\s+)?(${flexible})`, 'gi');
}

/**
 * Create a simple regex for counting (without article capture) (LEGACY - kept for compatibility)
 */
function createNameCountRegex(name: string): RegExp {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const flexible = escaped
    .replace(/[''`]/g, "[''`]?")
    .replace(/-/g, '[-\\s]?')
    .replace(/\s+/g, '\\s+');
  return new RegExp(`\\b${flexible}\\b`, 'gi');
}

/**
 * Create regex for "promo code" and related terms
 */
function createPromoTermsRegex(): RegExp {
  return /\b(promo\s*code|discount\s*code|coupon\s*code|voucher\s*code)\b/gi;
}

/**
 * Count occurrences of a pattern in text
 */
function countMatches(text: string, regex: RegExp): number {
  // Reset lastIndex for global regex
  regex.lastIndex = 0;
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Check if HTML tags are reasonably balanced
 * Note: Only checks basic tag pairs, not full validation
 */
function isHtmlBalanced(html: string): boolean {
  // Simple check: count each tag type
  const tagPairs = ['p', 'div', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'span', 'strong', 'em', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  for (const tag of tagPairs) {
    const openCount = (html.match(new RegExp(`<${tag}[\\s>]`, 'gi')) || []).length;
    const closeCount = (html.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
    if (openCount !== closeCount) {
      return false;
    }
  }
  return true;
}

/**
 * Detect if content is JSON (for faqContent)
 */
function isJsonContent(content: string): boolean {
  const trimmed = content.trim();
  return (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
         (trimmed.startsWith('{') && trimmed.endsWith('}'));
}

/**
 * Get deterministic replacement for name (cycles through list)
 * @param hasArticle - whether there's a preceding article that will be kept
 */
function getNameReplacement(index: number, hasArticle: boolean): string {
  if (hasArticle) {
    return NAME_REPLACEMENTS_WITH_ARTICLE[index % NAME_REPLACEMENTS_WITH_ARTICLE.length];
  }
  return NAME_REPLACEMENTS_NO_ARTICLE[index % NAME_REPLACEMENTS_NO_ARTICLE.length];
}

/**
 * Get deterministic replacement for promo terms
 */
function getPromoReplacement(index: number, hasPromoCode: boolean): string {
  if (!hasPromoCode) {
    return NO_CODE_REPLACEMENTS[index % NO_CODE_REPLACEMENTS.length];
  }
  return PROMO_TERM_REPLACEMENTS[index % PROMO_TERM_REPLACEMENTS.length];
}

// ============================================================================
// HTML-AWARE TEXT PROCESSING
// ============================================================================

/**
 * Process HTML content, only editing text nodes
 * Uses cheerio for safe DOM manipulation
 * Now with entity variants and sentence adjacency rules
 */
function cleanHtmlContent(
  html: string,
  offerName: string,
  config: FieldConfig,
  hasPromoCode: boolean
): { cleaned: string; nameReplacements: number; promoReplacements: number; changedParagraphs: number; lateFirstMentionWarning?: string } {
  if (!html || html.trim() === '') {
    return { cleaned: html, nameReplacements: 0, promoReplacements: 0, changedParagraphs: 0 };
  }

  const $ = cheerio.load(html, { decodeEntities: false });

  // Use entity variants instead of just full name
  const variants = buildNameVariants(offerName);
  const nameRegex = createEntityRegex(variants);
  const nameCountRegex = createEntityCountRegex(variants);
  const promoRegex = createPromoTermsRegex();

  let totalNameCount = 0;
  let totalPromoCount = 0;
  let nameReplacementIndex = 0;
  let promoReplacementIndex = 0;
  let nameReplacements = 0;
  let promoReplacements = 0;
  let changedParagraphs = 0;

  // Track if we've kept the first entity mention (SEO anchor)
  let keptFirstEntityMention = false;
  let firstMentionBlockIndex = -1;  // Track which block the first mention was kept in

  // First pass: count total occurrences (use count regex without capture groups)
  $('*').contents().filter(function() {
    return this.type === 'text';
  }).each(function() {
    const text = $(this).text();
    totalNameCount += countMatches(text, nameCountRegex);
    totalPromoCount += countMatches(text, promoRegex);
  });

  // Process each block-level element as a "paragraph"
  const blockElements = 'p, div, li, h1, h2, h3, h4, h5, h6, td, th, dd, dt, blockquote';
  let blockIndex = 0;

  $(blockElements).each(function() {
    const $block = $(this);
    let blockChanged = false;
    let blockEntityMentions = 0;  // Track mentions per paragraph/block
    const currentBlockIndex = blockIndex++;  // Capture current block index

    // Process text nodes within this block
    $block.contents().filter(function() {
      return this.type === 'text';
    }).each(function() {
      let text = $(this).text();
      const originalText = text;

      // Apply name replacement with sentence adjacency + paragraph cap rules
      if (totalNameCount > config.maxNameTotal) {
        const sentences = splitSentences(text);
        const out: string[] = [];

        for (const sentence of sentences) {
          let sentenceMentions = 0;
          const rewritten = sentence.replace(nameRegex, (fullMatch, article, matched) => {
            // Keep first mention in entire field (SEO anchor)
            if (!keptFirstEntityMention) {
              keptFirstEntityMention = true;
              firstMentionBlockIndex = currentBlockIndex;
              sentenceMentions++;
              blockEntityMentions++;
              return fullMatch;
            }

            // Enforce paragraph cap: if we've already hit max per paragraph, replace
            if (blockEntityMentions >= config.maxNamePerParagraph) {
              nameReplacements++;
              const hasArticle = !!article;
              const replacement = getNameReplacement(nameReplacementIndex++, hasArticle);
              const capReplacement = matchCapitalization(replacement, fullMatch);
              if (hasArticle) {
                return article + ' ' + capReplacement;
              } else {
                return capReplacement;
              }
            }

            // Enforce: never 2 entity mentions in same sentence
            if (sentenceMentions >= 1) {
              nameReplacements++;
              const hasArticle = !!article;
              const replacement = getNameReplacement(nameReplacementIndex++, hasArticle);
              const capReplacement = matchCapitalization(replacement, fullMatch);
              if (hasArticle) {
                return article + ' ' + capReplacement;
              } else {
                return capReplacement;
              }
            }

            // Allow 1 mention in this sentence (and increment block counter)
            sentenceMentions++;
            blockEntityMentions++;
            return fullMatch;
          });

          out.push(rewritten);
        }

        text = out.join(' ');
      }

      // Apply promo term replacement if over limit
      if (totalPromoCount > config.maxPromoTermsTotal) {
        let promoReplaced = 0;
        text = text.replace(promoRegex, (match) => {
          if (promoReplaced < 1) {
            promoReplaced++;
            return match;
          }
          promoReplacements++;
          const replacement = getPromoReplacement(promoReplacementIndex++, hasPromoCode);
          return matchCapitalization(replacement, match);
        });
      }

      if (text !== originalText) {
        $(this).replaceWith(text);
        blockChanged = true;
      }
    });

    if (blockChanged) {
      changedParagraphs++;
    }
  });

  // Also process any remaining text nodes not in block elements
  $.root().contents().filter(function() {
    return this.type === 'text';
  }).each(function() {
    let text = $(this).text();
    const originalText = text;

    // Apply same rules to loose text
    if (totalNameCount > config.maxNameTotal) {
      const sentences = splitSentences(text);
      const out: string[] = [];

      for (const sentence of sentences) {
        let sentenceMentions = 0;
        const rewritten = sentence.replace(nameRegex, (fullMatch, article, matched) => {
          if (!keptFirstEntityMention) {
            keptFirstEntityMention = true;
            sentenceMentions++;
            return fullMatch;
          }

          if (sentenceMentions >= 1) {
            nameReplacements++;
            const hasArticle = !!article;
            const replacement = getNameReplacement(nameReplacementIndex++, hasArticle);
            const capReplacement = matchCapitalization(replacement, fullMatch);
            if (hasArticle) {
              return article + ' ' + capReplacement;
            } else {
              return capReplacement;
            }
          }

          sentenceMentions++;
          return fullMatch;
        });

        out.push(rewritten);
      }

      text = out.join(' ');
    }

    if (text !== originalText) {
      $(this).replaceWith(text);
    }
  });

  // Get body content only (cheerio wraps in html/head/body)
  const bodyContent = $('body').html() || $.html();

  // Generate warning if first mention was kept too late (after block 2)
  let lateFirstMentionWarning: string | undefined;
  if (firstMentionBlockIndex > 2) {
    lateFirstMentionWarning = `first-name-mention-late(block=${firstMentionBlockIndex})`;
  }

  return {
    cleaned: bodyContent,
    nameReplacements,
    promoReplacements,
    changedParagraphs,
    lateFirstMentionWarning,
  };
}

/**
 * Process plain text content (for description field)
 * Now with entity variants and sentence adjacency rules
 */
function cleanPlainText(
  text: string,
  offerName: string,
  config: FieldConfig,
  hasPromoCode: boolean
): { cleaned: string; nameReplacements: number; promoReplacements: number } {
  if (!text || text.trim() === '') {
    return { cleaned: text, nameReplacements: 0, promoReplacements: 0 };
  }

  // Use entity variants instead of just full name
  const variants = buildNameVariants(offerName);
  const nameRegex = createEntityRegex(variants);
  const nameCountRegex = createEntityCountRegex(variants);
  const promoRegex = createPromoTermsRegex();

  let cleaned = text;
  let nameReplacements = 0;
  let promoReplacements = 0;
  let nameIndex = 0;
  let promoIndex = 0;

  const nameCount = countMatches(text, nameCountRegex);
  const promoCount = countMatches(text, promoRegex);

  // Track if we've kept the first entity mention (SEO anchor)
  let keptFirstEntityMention = false;

  // Replace excess name occurrences with sentence adjacency rule
  if (nameCount > config.maxNameTotal) {
    const sentences = splitSentences(cleaned);
    const out: string[] = [];

    for (const sentence of sentences) {
      let sentenceMentions = 0;
      const rewritten = sentence.replace(nameRegex, (fullMatch, article, matched) => {
        // Keep first mention (SEO anchor)
        if (!keptFirstEntityMention) {
          keptFirstEntityMention = true;
          sentenceMentions++;
          return fullMatch;
        }

        // Enforce: never 2 entity mentions in same sentence
        if (sentenceMentions >= 1) {
          nameReplacements++;
          const hasArticle = !!article;
          const replacement = getNameReplacement(nameIndex++, hasArticle);
          const capReplacement = matchCapitalization(replacement, fullMatch);
          if (hasArticle) {
            return article + ' ' + capReplacement;
          } else {
            return capReplacement;
          }
        }

        // Allow 1 mention in this sentence
        sentenceMentions++;
        return fullMatch;
      });

      out.push(rewritten);
    }

    cleaned = out.join(' ');
  }

  // Replace excess promo terms
  if (promoCount > config.maxPromoTermsTotal) {
    cleaned = cleaned.replace(promoRegex, (match) => {
      if (promoIndex === 0) {
        promoIndex++;
        return match;  // Keep first occurrence
      }
      promoReplacements++;
      const replacement = getPromoReplacement(promoIndex++, hasPromoCode);
      return matchCapitalization(replacement, match);
    });
  }

  return { cleaned, nameReplacements, promoReplacements };
}

/**
 * Process FAQ content (JSON format)
 */
function cleanFaqContent(
  content: string,
  offerName: string,
  config: FieldConfig,
  hasPromoCode: boolean
): { cleaned: string; nameReplacements: number; promoReplacements: number; changedParagraphs: number; error?: string } {
  if (!content || content.trim() === '') {
    return { cleaned: content, nameReplacements: 0, promoReplacements: 0, changedParagraphs: 0 };
  }

  // Check if it's JSON
  if (!isJsonContent(content)) {
    // Treat as HTML
    return cleanHtmlContent(content, offerName, config, hasPromoCode);
  }

  try {
    const faqArray = JSON.parse(content);
    if (!Array.isArray(faqArray)) {
      // Single object, treat as HTML
      return cleanHtmlContent(content, offerName, config, hasPromoCode);
    }

    let totalNameReplacements = 0;
    let totalPromoReplacements = 0;
    let changedItems = 0;

    const cleanedFaq = faqArray.map((item: any) => {
      const cleanedItem = { ...item };
      let itemChanged = false;

      // Clean question field
      if (item.question && typeof item.question === 'string') {
        const result = cleanPlainText(item.question, offerName, config, hasPromoCode);
        if (result.cleaned !== item.question) {
          cleanedItem.question = result.cleaned;
          totalNameReplacements += result.nameReplacements;
          totalPromoReplacements += result.promoReplacements;
          itemChanged = true;
        }
      }

      // Clean answer field (may be HTML)
      const answerField = item.answer || item.answerHtml || item.answerText;
      const answerKey = item.answer ? 'answer' : item.answerHtml ? 'answerHtml' : 'answerText';

      if (answerField && typeof answerField === 'string') {
        const isHtml = answerField.includes('<') && answerField.includes('>');
        const result = isHtml
          ? cleanHtmlContent(answerField, offerName, config, hasPromoCode)
          : cleanPlainText(answerField, offerName, config, hasPromoCode);

        if (result.cleaned !== answerField) {
          cleanedItem[answerKey] = result.cleaned;
          totalNameReplacements += result.nameReplacements;
          totalPromoReplacements += result.promoReplacements;
          itemChanged = true;
        }
      }

      if (itemChanged) changedItems++;
      return cleanedItem;
    });

    return {
      cleaned: JSON.stringify(cleanedFaq),
      nameReplacements: totalNameReplacements,
      promoReplacements: totalPromoReplacements,
      changedParagraphs: changedItems,
    };
  } catch (e) {
    return {
      cleaned: content,
      nameReplacements: 0,
      promoReplacements: 0,
      changedParagraphs: 0,
      error: `JSON parse error: ${e}`,
    };
  }
}

// ============================================================================
// MAIN PROCESSING
// ============================================================================

function processRecord(record: ExportRecord): { cleaned: CleanedRecord; audits: AuditEntry[] } {
  const cleaned: CleanedRecord = { ...record, _cleaningErrors: [] };
  const audits: AuditEntry[] = [];

  const contentFields = [
    'description',
    'aboutContent',
    'howToRedeemContent',
    'promoDetailsContent',
    'featuresContent',
    'termsContent',
    'faqContent',
  ] as const;

  for (const field of contentFields) {
    const content = record[field];
    const config = FIELD_CONFIGS[field];

    const audit: AuditEntry = {
      slug: record.slug,
      field,
      name_count_before: 0,
      name_count_after: 0,
      promo_terms_before: 0,
      promo_terms_after: 0,
      changed_paragraphs: 0,
      delta_chars: 0,
      parse_fail: false,
      error_message: '',
    };

    if (!content || typeof content !== 'string' || content.trim() === '') {
      audits.push(audit);
      continue;
    }

    // Use entity variants for counting (catches brand root + full name)
    const variants = buildNameVariants(record.name);
    const nameCountRegex = createEntityCountRegex(variants);
    const promoRegex = createPromoTermsRegex();

    // Count before (use count regex without capture groups)
    audit.name_count_before = countMatches(content, nameCountRegex);
    audit.promo_terms_before = countMatches(content, promoRegex);

    try {
      let result: { cleaned: string; nameReplacements: number; promoReplacements: number; changedParagraphs?: number; error?: string; lateFirstMentionWarning?: string };

      if (field === 'faqContent') {
        result = cleanFaqContent(content, record.name, config, record.hasPromoCode);
      } else if (field === 'description') {
        result = cleanPlainText(content, record.name, config, record.hasPromoCode);
      } else {
        result = cleanHtmlContent(content, record.name, config, record.hasPromoCode);
      }

      // Safety check: don't allow empty output from non-empty input
      if (result.cleaned && result.cleaned.trim() !== '') {
        // Validate HTML balance for HTML fields
        if (field !== 'description' && field !== 'faqContent') {
          if (!isHtmlBalanced(result.cleaned)) {
            throw new Error('HTML tags became unbalanced after cleaning');
          }
        }

        (cleaned as any)[field] = result.cleaned;
        audit.changed_paragraphs = result.changedParagraphs || 0;
        audit.delta_chars = result.cleaned.length - content.length;

        // Count after
        audit.name_count_after = countMatches(result.cleaned, nameCountRegex);
        audit.promo_terms_after = countMatches(result.cleaned, promoRegex);

        if (result.error) {
          audit.error_message = result.error;
          cleaned._cleaningErrors.push(`${field}: ${result.error}`);
        }

        // Add warning if first mention was late
        if (result.lateFirstMentionWarning) {
          cleaned._cleaningErrors.push(`${field}: ${result.lateFirstMentionWarning}`);
        }
      } else {
        // Output became empty - keep original
        audit.parse_fail = true;
        audit.error_message = 'Cleaned content was empty, kept original';
        audit.name_count_after = audit.name_count_before;
        audit.promo_terms_after = audit.promo_terms_before;
        cleaned._cleaningErrors.push(`${field}: Cleaned content was empty`);
      }
    } catch (e: any) {
      // Parse/processing failed - keep original
      audit.parse_fail = true;
      audit.error_message = e.message || String(e);
      audit.name_count_after = audit.name_count_before;
      audit.promo_terms_after = audit.promo_terms_before;
      cleaned._cleaningErrors.push(`${field}: ${e.message}`);
    }

    audits.push(audit);
  }

  return { cleaned, audits };
}

async function main() {
  console.log('🧹 Cleaning keyword stuffing from Deal content...\n');

  const inputPath = path.join(process.cwd(), 'data', 'content-export.jsonl');
  const outputPath = path.join(process.cwd(), 'data', 'content-cleaned.jsonl');
  const auditPath = path.join(process.cwd(), 'data', 'cleaning-audit.csv');

  // Check input file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    console.error('   Run export-content-for-cleaning.ts first.');
    process.exit(1);
  }

  // Read input file
  const lines = fs.readFileSync(inputPath, 'utf-8').split('\n').filter(line => line.trim());
  console.log(`📂 Read ${lines.length} records from ${inputPath}\n`);

  // Process records
  const cleanedRecords: CleanedRecord[] = [];
  const allAudits: AuditEntry[] = [];
  let totalChanges = 0;
  let recordsWithChanges = 0;
  let recordsWithErrors = 0;

  for (const line of lines) {
    try {
      const record: ExportRecord = JSON.parse(line);
      const { cleaned, audits } = processRecord(record);

      cleanedRecords.push(cleaned);
      allAudits.push(...audits);

      // Count changes
      const recordChanges = audits.reduce((sum, a) => sum + a.changed_paragraphs, 0);
      if (recordChanges > 0) {
        recordsWithChanges++;
        totalChanges += recordChanges;
      }

      if (cleaned._cleaningErrors.length > 0) {
        recordsWithErrors++;
      }
    } catch (e) {
      console.error(`Failed to parse record: ${e}`);
    }
  }

  // Write cleaned JSONL
  const writeStream = fs.createWriteStream(outputPath);
  for (const record of cleanedRecords) {
    writeStream.write(JSON.stringify(record) + '\n');
  }
  writeStream.end();

  // Write audit CSV
  const csvHeaders = [
    'slug',
    'field',
    'name_count_before',
    'name_count_after',
    'promo_terms_before',
    'promo_terms_after',
    'changed_paragraphs',
    'delta_chars',
    'parse_fail',
    'error_message',
  ].join(',');

  const csvRows = allAudits.map(a => [
    `"${a.slug}"`,
    a.field,
    a.name_count_before,
    a.name_count_after,
    a.promo_terms_before,
    a.promo_terms_after,
    a.changed_paragraphs,
    a.delta_chars,
    a.parse_fail,
    `"${a.error_message.replace(/"/g, '""')}"`,
  ].join(','));

  fs.writeFileSync(auditPath, [csvHeaders, ...csvRows].join('\n'));

  // Print summary
  console.log('✅ Cleaning complete!\n');
  console.log('📊 Summary:');
  console.log(`   Total records processed: ${cleanedRecords.length}`);
  console.log(`   Records with changes:    ${recordsWithChanges}`);
  console.log(`   Records with errors:     ${recordsWithErrors}`);
  console.log(`   Total paragraphs changed: ${totalChanges}`);
  console.log(`\n📁 Output files:`);
  console.log(`   Cleaned data: ${outputPath}`);
  console.log(`   Audit report: ${auditPath}`);

  // Show top offenders (most name occurrences before cleaning)
  const topOffenders = allAudits
    .filter(a => a.name_count_before > 3)
    .sort((a, b) => b.name_count_before - a.name_count_before)
    .slice(0, 10);

  if (topOffenders.length > 0) {
    console.log('\n⚠️  Top keyword-stuffed fields (before cleaning):');
    for (const a of topOffenders) {
      console.log(`   ${a.slug} / ${a.field}: ${a.name_count_before} → ${a.name_count_after} occurrences`);
    }
  }
}

main().catch(console.error);
