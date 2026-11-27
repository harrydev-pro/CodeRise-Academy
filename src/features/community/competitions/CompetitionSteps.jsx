import { Check } from "lucide-react";

const STEPS = ["Review", "Payment", "Confirmed"];

// Review → Payment → Confirmed. Free competitions skip Payment (it is shown as not needed).
// `current` is 1-based; steps before it are done. When `complete`, every step is done.
export default function CompetitionSteps({ current, free = false, complete = false }) {
  return (
    <nav className="community-card cmc-steps" aria-label="Registration progress">
      <ol>
        {STEPS.map((label, index) => {
          const number = index + 1;
          const skipped = free && number === 2;
          const done = complete || number < current;
          const active = !complete && number === current;
          const state = skipped ? "is-skipped" : done ? "is-done" : active ? "is-active" : "";
          return (
            <li key={label} className={`cmc-step ${state}`} aria-current={active ? "step" : undefined}>
              <span className="cmc-step-dot" aria-hidden="true">
                {done && !skipped ? <Check size={16} strokeWidth={3} /> : number}
              </span>
              <span className="cmc-step-label">
                {label}
                <span className="sr-only">
                  {skipped ? " (not needed, free entry)" : done ? " (done)" : active ? " (current step)" : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
