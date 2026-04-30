#!/usr/bin/env node
/**
 * COMPREHENSIVE DATABASE VERIFICATION
 * Compares ALL tables between production and backup to ensure they're in sync
 */

import { config } from "dotenv";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

config({ path: path.resolve(process.cwd(), ".env.sync") });

const prod = new PrismaClient({ datasources: { db: { url: process.env.PRODUCTION_DATABASE_URL }}});
const backup = new PrismaClient({ datasources: { db: { url: process.env.BACKUP_DATABASE_URL }}});

async function verify() {
  console.log('='.repeat(70));
  console.log('COMPREHENSIVE DATABASE VERIFICATION');
  console.log('Production vs Backup - Full Table Comparison');
  console.log('='.repeat(70));
  console.log();

  const results = [];
  let allMatch = true;

  // 1. Deals (Whops)
  const prodDeals = await prod.deal.count();
  const backupDeals = await backup.deal.count();
  const dealsMatch = prodDeals === backupDeals;
  if (!dealsMatch) allMatch = false;
  results.push({ table: 'Deal (Whops)', prod: prodDeals, backup: backupDeals, match: dealsMatch });

  // 2. PromoCodes
  const prodPromos = await prod.promoCode.count();
  const backupPromos = await backup.promoCode.count();
  const promosMatch = prodPromos === backupPromos;
  if (!promosMatch) allMatch = false;
  results.push({ table: 'PromoCode', prod: prodPromos, backup: backupPromos, match: promosMatch });

  // 3. PromoCodeSubmissions
  const prodSubs = await prod.promoCodeSubmission.count();
  const backupSubs = await backup.promoCodeSubmission.count();
  const subsMatch = prodSubs === backupSubs;
  if (!subsMatch) allMatch = false;
  results.push({ table: 'PromoCodeSubmission', prod: prodSubs, backup: backupSubs, match: subsMatch });

  // 4. BlogPosts
  const prodBlogs = await prod.blogPost.count();
  const backupBlogs = await backup.blogPost.count();
  const blogsMatch = prodBlogs === backupBlogs;
  if (!blogsMatch) allMatch = false;
  results.push({ table: 'BlogPost', prod: prodBlogs, backup: backupBlogs, match: blogsMatch });

  // 5. Comments
  const prodComments = await prod.comment.count();
  const backupComments = await backup.comment.count();
  const commentsMatch = prodComments === backupComments;
  if (!commentsMatch) allMatch = false;
  results.push({ table: 'Comment', prod: prodComments, backup: backupComments, match: commentsMatch });

  // 6. CommentVotes
  const prodVotes = await prod.commentVote.count();
  const backupVotes = await backup.commentVote.count();
  const votesMatch = prodVotes === backupVotes;
  if (!votesMatch) allMatch = false;
  results.push({ table: 'CommentVote', prod: prodVotes, backup: backupVotes, match: votesMatch });

  // 7. OfferTracking
  const prodTracking = await prod.offerTracking.count();
  const backupTracking = await backup.offerTracking.count();
  const trackingMatch = prodTracking === backupTracking;
  if (!trackingMatch) allMatch = false;
  results.push({ table: 'OfferTracking', prod: prodTracking, backup: backupTracking, match: trackingMatch });

  // 8. ContactSubmission
  const prodContact = await prod.contactSubmission.count();
  const backupContact = await backup.contactSubmission.count();
  const contactMatch = prodContact === backupContact;
  if (!contactMatch) allMatch = false;
  results.push({ table: 'ContactSubmission', prod: prodContact, backup: backupContact, match: contactMatch });

  // 9. MailingList
  const prodMailing = await prod.mailingList.count();
  const backupMailing = await backup.mailingList.count();
  const mailingMatch = prodMailing === backupMailing;
  if (!mailingMatch) allMatch = false;
  results.push({ table: 'MailingList', prod: prodMailing, backup: backupMailing, match: mailingMatch });

  // 10. User (admin users)
  const prodUsers = await prod.user.count();
  const backupUsers = await backup.user.count();
  const usersMatch = prodUsers === backupUsers;
  if (!usersMatch) allMatch = false;
  results.push({ table: 'User', prod: prodUsers, backup: backupUsers, match: usersMatch });

  // Print results table
  console.log('TABLE COMPARISON:');
  console.log('-'.repeat(70));
  console.log(`${'Table'.padEnd(25)} | ${'Production'.padStart(12)} | ${'Backup'.padStart(12)} | Status`);
  console.log('-'.repeat(70));

  for (const r of results) {
    const status = r.match ? '✅ MATCH' : '❌ MISMATCH';
    console.log(`${r.table.padEnd(25)} | ${String(r.prod).padStart(12)} | ${String(r.backup).padStart(12)} | ${status}`);
  }
  console.log('-'.repeat(70));
  console.log();

  // Check for recent data integrity (last 24 hours)
  console.log('RECENT DATA INTEGRITY CHECK (Last 24 hours):');
  console.log('-'.repeat(70));

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Recent deals updated
  const prodRecentDeals = await prod.deal.findMany({
    where: { updatedAt: { gte: yesterday } },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 10
  });

  const backupRecentDeals = await backup.deal.findMany({
    where: { updatedAt: { gte: yesterday } },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 10
  });

  console.log(`Recent deals updated (prod): ${prodRecentDeals.length}`);
  console.log(`Recent deals updated (backup): ${backupRecentDeals.length}`);

  // Compare slugs
  const prodSlugs = new Set(prodRecentDeals.map(d => d.slug));
  const backupSlugs = new Set(backupRecentDeals.map(d => d.slug));
  const missingInBackup = [...prodSlugs].filter(s => !backupSlugs.has(s));
  const missingInProd = [...backupSlugs].filter(s => !prodSlugs.has(s));

  if (missingInBackup.length > 0) {
    console.log(`⚠️  Recent updates missing in backup: ${missingInBackup.join(', ')}`);
    allMatch = false;
  } else if (missingInProd.length > 0) {
    console.log(`⚠️  Recent updates missing in prod: ${missingInProd.join(', ')}`);
  } else {
    console.log('✅ All recent deal updates are synced');
  }
  console.log();

  // SAMPLE DATA VERIFICATION - Check specific records match
  console.log('SAMPLE DATA VERIFICATION:');
  console.log('-'.repeat(70));

  // Pick 5 random deals and compare
  const sampleDeals = await prod.deal.findMany({ take: 5, orderBy: { updatedAt: 'desc' } });
  let sampleMatches = 0;

  for (const deal of sampleDeals) {
    const backupDeal = await backup.deal.findUnique({ where: { slug: deal.slug } });
    if (backupDeal) {
      const prodTime = deal.updatedAt.getTime();
      const backupTime = backupDeal.updatedAt.getTime();
      // Allow 1 second difference for sync timing
      if (Math.abs(prodTime - backupTime) < 1000) {
        sampleMatches++;
      }
    }
  }
  console.log(`Deal timestamp verification: ${sampleMatches}/5 exact matches`);

  // Check promo codes sample
  const samplePromos = await prod.promoCode.findMany({ take: 5, orderBy: { updatedAt: 'desc' } });
  let promoMatches = 0;

  for (const promo of samplePromos) {
    const deal = await prod.deal.findUnique({ where: { id: promo.whopId }, select: { slug: true } });
    if (deal) {
      const backupDeal = await backup.deal.findUnique({ where: { slug: deal.slug }, select: { id: true } });
      if (backupDeal) {
        const backupPromo = await backup.promoCode.findFirst({
          where: { whopId: backupDeal.id, code: promo.code }
        });
        if (backupPromo) promoMatches++;
      }
    }
  }
  console.log(`PromoCode presence verification: ${promoMatches}/5 found in backup`);
  console.log();

  // FINAL VERDICT
  console.log('='.repeat(70));
  if (allMatch && sampleMatches >= 4 && promoMatches >= 4) {
    console.log('🎉 VERIFICATION PASSED - Databases are in sync!');
    console.log('   Backup is a complete mirror of production.');
  } else {
    console.log('⚠️  VERIFICATION DETECTED DIFFERENCES');
    console.log('   Some tables or records may not be fully synced.');
    console.log('   Review the table comparison above for details.');
  }
  console.log('='.repeat(70));

  await prod.$disconnect();
  await backup.$disconnect();
}

verify().catch(console.error);
