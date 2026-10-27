import { AlertCircle } from "lucide-react";

export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      <AlertCircle size={19} className="mt-0.5 shrink-0" />

      <p>{message}</p>
    </div>
  );
}