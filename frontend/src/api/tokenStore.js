const ACCESS_KEY = 'reddit_clone_access_token';
const REFRESH_KEY = 'reddit_clone_refresh_token';

let accessToken = localStorage.getItem(ACCESS_KEY);
let refreshToken = localStorage.getItem(REFRESH_KEY);

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

export function setTokens({ accessToken: at, refreshToken: rt } = {}) {
  accessToken = at ?? null;
  refreshToken = rt ?? null;

  if (at) localStorage.setItem(ACCESS_KEY, at);
  else localStorage.removeItem(ACCESS_KEY);

  if (rt) localStorage.setItem(REFRESH_KEY, rt);
  else localStorage.removeItem(REFRESH_KEY);
}

export function clearTokens() {
  setTokens({});
}
