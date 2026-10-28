const DEFAULT_API_URL = 'http://localhost:5000/api';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || DEFAULT_API_URL;

export async function apiClient(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: payload?.message || payload || 'Request failed.',
      data: payload,
    };
  }

  return {
    ok: true,
    status: response.status,
    data: payload,
  };
}
