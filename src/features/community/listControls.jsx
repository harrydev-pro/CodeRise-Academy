import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";

import { pageItems } from "./listHooks";

// Shared components for the Community list screens. The hooks live in listHooks.js.

export function FilterChip({ active, onClick, children, count }) {
  return (
    <button type="button" className={`community-filter-chip${active ? " active" : ""}`} aria-pressed={active} onClick={onClick}>
      {children}
      {typeof count === "number" && <span className="community-chip-count">{count}</span>}
    </button>
  );
}

export function NoResults({ onClear, noun = "projects" }) {
  return (
    <div className="community-card community-empty">
      <span className="community-icon tone-blue"><SearchX size={22} aria-hidden="true" /></span>
      <h2>No {noun} match your filters</h2>
      <p className="muted-text">Try a different search word or remove a filter.</p>
      <button type="button" className="btn btn-outline btn-sm" onClick={onClear}>Clear filters</button>
    </div>
  );
}

// arrows: chevron buttons (Project Library); otherwise "Previous" / "Next" text buttons.
export function Pager({ pagination, onPage, label = "Pages", arrows = false }) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;
  return (
    <nav className="community-pager" aria-label={label}>
      <button type="button" className="community-page-button" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label={arrows ? "Previous page" : undefined}>
        {arrows ? <ChevronLeft size={18} aria-hidden="true" /> : "Previous"}
      </button>
      {pageItems(page, totalPages).map((item, index) => (
        item === "gap"
          ? <span key={`gap-${index}`} className="community-page-button is-gap" aria-hidden="true">…</span>
          : (
            <button
              key={item}
              type="button"
              className={`community-page-button${item === page ? " active" : ""}`}
              aria-current={item === page ? "page" : undefined}
              aria-label={`Page ${item}`}
              onClick={() => item !== page && onPage(item)}
            >
              {item}
            </button>
          )
      ))}
      <button type="button" className="community-page-button" disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label={arrows ? "Next page" : undefined}>
        {arrows ? <ChevronRight size={18} aria-hidden="true" /> : "Next"}
      </button>
    </nav>
  );
}
