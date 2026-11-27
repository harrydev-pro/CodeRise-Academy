import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// Shared hooks and helpers for the Community list screens (Project Library, Collaboration
// Library, …). The matching components live in listControls.jsx.

// Loads a list for the given filters. While new filters load, the previous results stay on
// screen (refreshing = true) so the page does not jump back to a spinner.
// `fetcher` must be a stable function (a module-level service function).
export function useCommunityList(fetcher, filters) {
  const key = JSON.stringify(filters);
  const [state, setState] = useState({ key: null, data: null, error: "" });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    fetcher(JSON.parse(key))
      .then((data) => active && setState({ key, data, error: "" }))
      .catch((error) => active && setState({ key, data: null, error: error.message || "This list could not be loaded." }));
    return () => { active = false; };
  }, [fetcher, key, revision]);

  const settled = state.key === key;
  return {
    data: state.data,
    error: settled ? state.error : "",
    loading: !state.data && !state.error,
    refreshing: !settled && Boolean(state.data),
    reload,
  };
}

// Filters live in the URL so a filtered list can be shared, bookmarked and restored with Back.
// update({ name: value }) sets or removes query parameters and returns to page 1 unless the
// change is the page itself. Values equal to `defaults` are left out of the URL.
export function useUrlFilters(defaults = {}) {
  const [params, setParams] = useSearchParams();

  function update(changes) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      for (const [name, value] of Object.entries(changes)) {
        if (value === "" || value === null || value === undefined || String(value) === String(defaults[name] ?? "")) next.delete(name);
        else next.set(name, String(value));
      }
      if (!("page" in changes)) next.delete("page");
      if (next.get("page") === "1") next.delete("page");
      return next;
    });
  }

  return { params, update, clear: () => setParams({}) };
}

// Text search that updates the URL a moment after the student stops typing.
export function useDebouncedSearch(value, onCommit, delay = 350) {
  const [text, setText] = useState(value);
  useEffect(() => {
    if (text.trim() === value) return undefined;
    const timer = window.setTimeout(() => onCommit(text.trim()), delay);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return [text, setText];
}

export function readPage(params) {
  return Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
}

// Page numbers with gaps, e.g. 1 2 3 … 8 or 1 … 4 5 6 … 8.
export function pageItems(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3].forEach((value) => pages.add(value));
  if (page >= totalPages - 2) [totalPages - 2, totalPages - 1].forEach((value) => pages.add(value));
  const sorted = [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
  return sorted.flatMap((value, index) => (index > 0 && value - sorted[index - 1] > 1 ? ["gap", value] : [value]));
}
