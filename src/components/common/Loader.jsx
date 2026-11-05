import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

const SLOW_AFTER_MS = 6000;

export function Loader({ fullScreen = false, label = "Loading..." }) {
  const [slow, setSlow] = useState(false);

  // The backend can take up to a minute to wake up after a quiet period, so a long
  // wait gets an explanation instead of an endless spinner.
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center" role="status" aria-live="polite">
      <LoaderCircle
        className="animate-spin text-brand-600"
        size={32}
        aria-hidden="true"
      />

      <p className="text-sm text-gray-500">{label}</p>

      {slow && (
        <p className="max-w-xs text-xs leading-5 text-gray-400">
          This is taking longer than usual. The server may be waking up; please keep this page open.
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        {content}
      </div>
    );
  }

  return content;
}

export default Loader;
