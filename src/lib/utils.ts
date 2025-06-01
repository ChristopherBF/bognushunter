/**
 * Format item name to be more readable by replacing hyphens with spaces
 * and capitalizing each word
 */
export const formatItemName = (name: string): string => {
  if (!name) return '';
  return name
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
