import { AlertCircle } from "lucide-react";

export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      <AlertCircle size={19} className="mt-0.5 shrink-0" />

      <div className="min-w-0 flex-1">
        <p>{message}</p>
        {onRetry && (
          <button type="button" className="mt-2 font-semibold underline" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
