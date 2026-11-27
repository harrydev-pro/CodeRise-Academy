import { useEffect, useState } from "react";

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

// Live days / hours / mins / secs countdown to `target` (an ISO date). Screen readers get one
// summary label instead of the ticking numbers. `doneLabel` is read out once time is up.
export default function Countdown({ target, doneLabel = "Started" }) {
  const now = useNow();
  const remaining = Math.max(0, new Date(target).getTime() - now);
  const parts = [
    ["days", Math.floor(remaining / 86400000)],
    ["hours", Math.floor(remaining / 3600000) % 24],
    ["mins", Math.floor(remaining / 60000) % 60],
    ["secs", Math.floor(remaining / 1000) % 60],
  ];
  const label = remaining > 0 ? `${parts[0][1]} days, ${parts[1][1]} hours and ${parts[2][1]} minutes to go` : doneLabel;
  return (
    <div className="community-countdown" role="timer" aria-label={label}>
      {parts.map(([unit, value]) => (
        <span key={unit} className="community-countdown-cell" aria-hidden="true">
          <strong>{String(value).padStart(2, "0")}</strong>
          <small>{unit}</small>
        </span>
      ))}
    </div>
  );
}
