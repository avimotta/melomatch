/**
 * Return the best available avatar URL for a user.
 *
 * - If a custom image URL is set (not from DiceBear), use it as-is.
 * - If a DiceBear URL is stored, normalise it to the `notionists` style.
 * - Otherwise generate a deterministic DiceBear avatar from the user's `id`.
 *
 * DiceBear is SVG-based, lightweight and never needs file uploads.
 * Normalising to notionists ensures every user sees the same style.
 */
export function getAvatarUrl(
  avatarUrl: string | null | undefined,
  id: string,
) {
  if (avatarUrl) {
    // Normalise any DiceBear URL so all avatars use the same style
    if (avatarUrl.includes("dicebear.com")) {
      return avatarUrl.replace(/\/7\.x\/[^/]+\//, "/7.x/notionists/");
    }
    return avatarUrl;
  }
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${id}`;
}
