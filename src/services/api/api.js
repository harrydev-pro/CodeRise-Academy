import { requestData } from "./dataClient";

// Small helpers so pages read clearly: api.get("/admin/users", "users").
const json = (method, body) => ({ method, body: JSON.stringify(body ?? {}) });

export const api = {
  get: (path, key) => requestData(path, key),
  post: (path, body, key) => requestData(path, key, json("POST", body)),
  put: (path, body, key) => requestData(path, key, json("PUT", body)),
  patch: (path, body, key) => requestData(path, key, json("PATCH", body)),
  delete: (path, key) => requestData(path, key, { method: "DELETE" }),
};

// Uploads a file. purpose: "avatar" | "attachment" | "image" (admins only).
export async function uploadFile(file, purpose) {
  const form = new FormData();
  form.append("purpose", purpose);
  form.append("file", file);
  return requestData("/uploads", "file", { method: "POST", body: form });
}

// Builds a query string from an object, skipping empty values.
export function queryString(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}
