import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export default function Toast({
  message,
  type = "success",
  onClose,
}) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, 3500);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const success = type === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <div
      role="status"
      className={[
        "fixed bottom-5 right-5 z-[120] flex max-w-sm items-start gap-3",
        "rounded-xl border bg-white p-4 shadow-xl",
        success ? "border-green-200" : "border-red-200",
      ].join(" ")}
    >
      <Icon
        size={20}
        className={success ? "text-green-600" : "text-red-600"}
      />

      <p className="flex-1 text-sm text-ink">{message}</p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="text-gray-400 hover:text-gray-700"
      >
        <X size={17} />
      </button>
    </div>
  );
}