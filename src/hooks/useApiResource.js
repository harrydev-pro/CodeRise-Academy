import { useCallback, useEffect, useState } from "react";
import { requestData } from "../services/api/dataClient";

const EMPTY_LIST = [];

// Loads `endpoint` and returns { data, loading, refreshing, error, reload }.
// - Results are tagged with the request they belong to, so a slow response for an old
//   endpoint can never overwrite the data for the current one.
// - reload() keeps showing the current data while fresh data loads (refreshing = true), so
//   pages do not flash a spinner and lose messages, open panels, or scroll position.
export function useApiResource(endpoint, key, fallback = EMPTY_LIST, enabled = true) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({ requestId: null, baseKey: null, data: undefined, error: "" });

  const baseKey = enabled && endpoint ? `${endpoint}\u0000${key ?? ""}` : null;
  const requestId = baseKey ? `${baseKey}\u0000${revision}` : null;
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    if (!requestId) return undefined;
    let active = true;
    requestData(endpoint, key)
      .then((value) => {
        if (active) setResult({ requestId, baseKey, data: value, error: "" });
      })
      .catch((requestError) => {
        if (active) {
          setResult({
            requestId,
            baseKey,
            data: undefined,
            error: requestError.message || "The service is temporarily unavailable.",
          });
        }
      });
    return () => { active = false; };
  }, [requestId, baseKey, endpoint, key]);

  if (!requestId) return { data: fallback, loading: false, refreshing: false, error: "", reload };

  const settled = result.requestId === requestId;
  if (settled) {
    return { data: result.data ?? fallback, loading: false, refreshing: false, error: result.error, reload };
  }
  // Same resource, newer request in flight: keep the previous successful data on screen.
  if (result.baseKey === baseKey && !result.error) {
    return { data: result.data ?? fallback, loading: false, refreshing: true, error: "", reload };
  }
  return { data: fallback, loading: true, refreshing: false, error: "", reload };
}
