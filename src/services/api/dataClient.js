import { apiClient } from "./client";

export async function requestData(endpoint, key, options) {
  const result = await apiClient(endpoint, options);
  if (!result.ok) {
    const error = new Error(result.error || "The service could not complete your request.");
    error.status = result.status;
    error.data = result.data;
    throw error;
  }
  const payload = result.data?.data ?? result.data ?? {};
  return key ? payload[key] : payload;
}
