// src/utils/apiClient.js
const API_BASE = 'https://overtime-ddyl.onrender.com';

let tokens = {
  accessToken: null,
  refreshToken: null,
};

export function setAuthTokens({ accessToken, refreshToken }) {
  tokens.accessToken = accessToken || null;
  tokens.refreshToken = refreshToken || null;
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  else localStorage.removeItem('accessToken');
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  else localStorage.removeItem('refreshToken');
}

export function getAuthTokens() {
  return {
    accessToken: tokens.accessToken || localStorage.getItem('accessToken'),
    refreshToken: tokens.refreshToken || localStorage.getItem('refreshToken'),
  };
}

async function refreshAccessToken() {
  const { refreshToken } = getAuthTokens();
  if (!refreshToken) throw new Error('No refresh token');
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error('Refresh failed');
  const data = await res.json();
  setAuthTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.accessToken;
}

export async function fetchWithAuth(path, options = {}) {
  const { accessToken } = getAuthTokens();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const exec = async () => fetch(`${API_BASE}${path}`, { ...options, headers });

  let res = await exec();
  if (res.status === 401) {
    try {
      const newAccess = await refreshAccessToken();
      headers.set('Authorization', `Bearer ${newAccess}`);
      res = await exec();
    } catch (e) {
      // Propagar 401 para que el contexto haga logout
      throw new Error('UNAUTHORIZED');
    }
  }
  return res;
}

export { API_BASE };
