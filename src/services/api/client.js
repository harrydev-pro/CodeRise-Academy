// All API requests go to the same origin as the website under /api. Vercel (vercel.json)
// and the Vite dev server (vite.config.js) forward /api/* to the backend. Keeping the API
// on the website's own origin makes the session and CSRF cookies first-party, which Safari
// on iPhone requires. Only override VITE_API_BASE_URL if you know the cookies will still be
// first-party (for example a same-site api.yourdomain.com).
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

const RETRYABLE_STATUSES = new Set([502, 503, 504]);
const RETRY_DELAYS_MS = [2000, 5000];

let csrfToken = null;

function makeUrl(endpoint) {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

// Retries only safe (read-only) requests when the network fails or the backend is still
// waking up on Render. Mutations are never retried automatically, so a form can't be
// submitted twice.
async function fetchWithWakeUpRetry(url, init, retrySafe) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await fetch(url, init);
      if (!retrySafe || !RETRYABLE_STATUSES.has(response.status) || attempt >= RETRY_DELAYS_MS.length) {
        return response;
      }
    } catch (error) {
      if (!retrySafe || attempt >= RETRY_DELAYS_MS.length) {
        throw new Error('We couldn’t reach CodeRise Academy. Check your internet connection and try again.', { cause: error });
      }
    }
    await wait(RETRY_DELAYS_MS[attempt]);
  }
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

async function getCsrfToken() {
  const response = await fetchWithWakeUpRetry(makeUrl('/auth/csrf'), {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  }, true);
  const payload = await readPayload(response);
  if (!response.ok || !payload?.csrfToken) {
    throw new Error(payload?.message || 'Unable to establish a secure session.');
  }
  csrfToken = payload.csrfToken;
  return csrfToken;
}

export async function apiClient(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  // FormData (file uploads) sets its own multipart Content-Type with the boundary.
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    Accept: 'application/json',
    ...(options.body && !isForm ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };
  if (mutating) headers['X-CSRF-Token'] = csrfToken || await getCsrfToken();

  let response = await fetchWithWakeUpRetry(makeUrl(endpoint), {
    ...options,
    method,
    credentials: 'include',
    headers,
  }, !mutating);
  let payload = await readPayload(response);

  if (mutating && response.status === 403 && payload?.message?.includes('CSRF')) {
    csrfToken = await getCsrfToken();
    response = await fetchWithWakeUpRetry(makeUrl(endpoint), {
      ...options,
      method,
      credentials: 'include',
      headers: { ...headers, 'X-CSRF-Token': csrfToken },
    }, false);
    payload = await readPayload(response);
  }

  if (!response.ok) {
    const validationErrors = Array.isArray(payload?.errors)
      ? payload.errors
          .map(({ field, message }) => [field, message].filter(Boolean).join(': '))
          .filter(Boolean)
          .join('. ')
      : '';
    const error = response.status >= 500
      ? 'The service is temporarily unavailable. Please try again in a moment.'
      : typeof payload === 'string'
        ? (/<[a-z!]/i.test(payload) ? `Request failed (${response.status}).` : payload)
        : [payload?.message || payload?.error, validationErrors]
            .filter(Boolean)
            .join(': ') || `Request failed (${response.status}).`;
    return { ok: false, status: response.status, error, data: payload };
  }
  return { ok: true, status: response.status, data: payload };
}
