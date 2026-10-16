/**
 * Media Type Detection & Smart Rendering Utilities
 * Handles videos (mp4, webm, mov) and animated/static images (webp, gif, png, mux animated webp, etc.)
 * even when URLs contain complex query parameters (e.g., ?width=640&fps=15).
 */

export function isMediaImage(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  try {
    // 1. Data URLs
    if (trimmed.startsWith('data:image/')) return true;

    // 2. Clean pathname without query parameters or hash fragments
    const cleanPath = trimmed.split('?')[0].split('#')[0].toLowerCase();

    // 3. Direct image extensions in pathname
    const imageExtensions = ['.webp', '.gif', '.png', '.jpg', '.jpeg', '.svg', '.avif', '.bmp'];
    if (imageExtensions.some((ext) => cleanPath.endsWith(ext))) {
      return true;
    }

    // 4. Known image services & query formats
    const lower = trimmed.toLowerCase();
    if (
      lower.includes('image.mux.com') ||
      lower.includes('/animated.webp') ||
      lower.includes('.webp?') ||
      lower.includes('.gif?') ||
      lower.includes('.png?') ||
      lower.includes('.jpg?') ||
      lower.includes('.jpeg?') ||
      lower.includes('images.unsplash.com') ||
      lower.includes('/image/') ||
      lower.includes('/images/')
    ) {
      return true;
    }

    // 5. Video extensions in clean pathname
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
    if (videoExtensions.some((ext) => cleanPath.endsWith(ext))) {
      return false;
    }

    return false;
  } catch {
    return false;
  }
}

export function getMediaTypeName(url?: string): 'Animated WebP / GIF' | 'Video (MP4/WebM)' | 'None' {
  if (!url || !url.trim()) return 'None';
  return isMediaImage(url) ? 'Animated WebP / GIF' : 'Video (MP4/WebM)';
}
