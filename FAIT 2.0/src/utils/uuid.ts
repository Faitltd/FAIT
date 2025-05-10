/**
 * Generate a UUID v4 string
 * This is a simple implementation that creates a UUID v4 compatible string
 * Used for development mode to create IDs that match Supabase's UUID format
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
