/**
 * Utility functions for generating initials from course/whop names
 */

/**
 * Extracts initials from a name string
 * Examples:
 * - "FanPro" → "FP"
 * - "Alpha Signals" → "AS"
 * - "Discord Trading Community" → "DT"
 * - "AI Course 2024" → "AC"
 * - "The Ultimate Guide" → "TU"
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') {
    return 'XX';
  }

  // Clean the name: remove special characters and extra spaces
  const cleanName = name.trim().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
  
  if (!cleanName) {
    return 'XX';
  }

  // Split into words
  const words = cleanName.split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) {
    return 'XX';
  }
  
  if (words.length === 1) {
    // Single word: take first two characters
    const word = words[0].toUpperCase();
    return word.length >= 2 ? word.substring(0, 2) : word + 'X';
  }
  
  if (words.length === 2) {
    // Two words: take first character of each
    return words[0][0].toUpperCase() + words[1][0].toUpperCase();
  }
  
  // Three or more words: prioritize meaningful words
  const meaningfulWords = words.filter(word => 
    !['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', '&'].includes(word.toLowerCase())
  );
  
  if (meaningfulWords.length >= 2) {
    // Use first two meaningful words
    return meaningfulWords[0][0].toUpperCase() + meaningfulWords[1][0].toUpperCase();
  } else if (meaningfulWords.length === 1) {
    // Use the meaningful word + first non-meaningful word
    const meaningfulWord = meaningfulWords[0];
    const otherWord = words.find(word => word !== meaningfulWord);
    return meaningfulWord[0].toUpperCase() + (otherWord ? otherWord[0].toUpperCase() : 'X');
  } else {
    // Fallback: use first two words
    return words[0][0].toUpperCase() + words[1][0].toUpperCase();
  }
}

/**
 * Generates a consistent background color based on the name
 * This ensures the same name always gets the same color
 */
export function getInitialsColor(name: string): string {
  if (!name) return '#6366f1'; // Default accent color
  
  // Simple hash function to generate consistent colors
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Predefined color palette that works well with both light and dark themes
  const colors = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#84cc16', // Lime
    '#f97316', // Orange
    '#3b82f6', // Blue
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Gets initials with consistent styling properties
 */
export function getInitialsData(name: string) {
  return {
    initials: getInitials(name),
    backgroundColor: getInitialsColor(name),
    textColor: '#ffffff', // Always white text for good contrast
  };
} 