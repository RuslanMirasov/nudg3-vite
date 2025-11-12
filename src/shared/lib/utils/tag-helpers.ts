import { TAG_COLOR_MAPPINGS, DEFAULT_TAG_COLORS } from '@/shared/lib/constants';

/**
 * Get consistent color classes for a tag
 * @param tag The tag name
 * @returns Tailwind CSS classes for the tag color
 */
export function getTagColor(tag: string): string {
  // Check if we have a specific color for this tag

  const specificColor = TAG_COLOR_MAPPINGS[tag.toLowerCase()];
  if (specificColor) {
    return specificColor;
  }

  // For unknown tags, use a consistent color based on the tag name
  // This ensures the same tag always gets the same color
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    const char = tag.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }

  const colorIndex = Math.abs(hash) % DEFAULT_TAG_COLORS.length;
  return DEFAULT_TAG_COLORS[colorIndex] as string;
}
