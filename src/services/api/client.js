// API calls stay same-origin in both environments: Vite proxies during local
// development and vercel.json proxies in production. This keeps auth cookies
// first-party in Safari and other strict browsers.
export const API_BASE_URL = '';

let csrfToken = null;
let csrfTokenRequest = null;

function makeUrl(endpoint) {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

async function readPayload(response) {
  const contentType = response.headers.get('content-type') || '';
  const responseBody = await response.text();
  if (!responseBody) return null;
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(responseBody);
    } catch {
      throw new Error(`The API returned invalid JSON (${response.status}).`);
    }
  }
  return responseBody;
}

function getCsrfToken() {
  if (!csrfTokenRequest) {
    csrfTokenRequest = (async () => {
      const response = await fetch(makeUrl('/auth/csrf'), {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const payload = await readPayload(response);
      if (!response.ok || !payload?.csrfToken) {
        throw new Error(payload?.message || 'Unable to establish a secure session.');
      }
      csrfToken = payload.csrfToken;
      return csrfToken;
    })().finally(() => {
      csrfTokenRequest = null;
    });
  }
  return csrfTokenRequest;
}

export async function apiClient(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };
  if (mutating) headers['X-CSRF-Token'] = csrfToken || await getCsrfToken();

  let response = await fetch(makeUrl(endpoint), {
    ...options,
    method,
    credentials: 'include',
    headers,
  });
  let payload = await readPayload(response);

  if (mutating && response.status === 403 && payload?.message?.includes('CSRF')) {
    csrfToken = await getCsrfToken();
    response = await fetch(makeUrl(endpoint), {
      ...options,
      method,
      credentials: 'include',
      headers: { ...headers, 'X-CSRF-Token': csrfToken },
    });
    payload = await readPayload(response);
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
    return { ok: false, status: response.status, error, data: payload };
  }
  return { ok: true, status: response.status, data: payload };
}
