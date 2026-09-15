const FALLBACK = 'Something went wrong. Please try again.';

export function getErrorMessage(error, fallback = FALLBACK) {
  const data = error?.response?.data;

  if (typeof data === 'string' && data.trim() && !data.trim().startsWith('<')) {
    return data.trim();
  }
  if (typeof data?.error === 'string' && data.error.trim()) return data.error.trim();
  if (typeof data?.message === 'string' && data.message.trim()) return data.message.trim();

  if (Array.isArray(data?.details)) {
    const joined = data.details
      .map((detail) => (typeof detail === 'string' ? detail : detail?.message))
      .filter(Boolean)
      .join(', ');
    if (joined) return joined;
  }

  if (error?.code === 'ERR_NETWORK') return 'Cannot reach the server. Is it running?';
  if (error?.response?.status === 429) return 'Too many requests. Please slow down and try again.';
  if (error?.response?.status >= 500) return 'The server ran into a problem. Please try again.';

  return fallback;
}

export function getErrorStatus(error) {
  return error?.response?.status ?? null;
}
