export function postPath(post) {
  if (!post?.id) return '/';
  return post.community_name ? `/r/${post.community_name}/posts/${post.id}` : `/posts/${post.id}`;
}

export function linkHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function isHttpUrl(value) {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
