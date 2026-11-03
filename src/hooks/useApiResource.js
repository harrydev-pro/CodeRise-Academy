import { useCallback, useEffect, useState } from "react";
import { requestData } from "../services/api/dataClient";

const EMPTY_LIST = [];

export function useApiResource(endpoint, key, fallback = EMPTY_LIST, enabled = true) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    if (!enabled || !endpoint) {
      setData(fallback);
      setLoading(false);
      setError("");
      return undefined;
    }
    let active = true;
    setLoading(true);
    setError("");
    requestData(endpoint, key)
      .then((value) => { if (active) setData(value ?? fallback); })
      .catch((requestError) => {
        if (active) setError(requestError.message || "The service is temporarily unavailable.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [endpoint, key, enabled, fallback, revision]);

  return { data, loading, error, reload };
}
