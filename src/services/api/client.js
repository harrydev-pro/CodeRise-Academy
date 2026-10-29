const DEFAULT_API_URL = 'http://localhost:3000';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || DEFAULT_API_URL;

export async function apiClient(endpoint, options = {}) {
  const url = /^https?:\/\//i.test(endpoint)
    ? endpoint
    : `${API_BASE_URL.replace(/\/+$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const responseBody = await response.text();
  let payload = responseBody;

  if (responseBody && contentType.includes('application/json')) {
    try {
      payload = JSON.parse(responseBody);
    } catch {
      throw new Error(`The API returned invalid JSON (${response.status}).`);
    }
  } else if (!responseBody) {
    payload = null;
  }

  if (!response.ok) {
    const validationErrors = Array.isArray(payload?.errors)
      ? payload.errors
          .map(({ field, message }) => [field, message].filter(Boolean).join(': '))
          .filter(Boolean)
          .join('. ')
      : '';
    const error = typeof payload === 'string'
      ? payload
      : [payload?.message || payload?.error, validationErrors]
          .filter(Boolean)
          .join(': ') || `Request failed (${response.status}).`;

    return {
      ok: false,
      status: response.status,
      error,
      data: payload,
    };
  }

  return {
    ok: true,
    status: response.status,
    data: payload,
  };
}
