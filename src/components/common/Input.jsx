import { forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    id,
    type = "text",
    className = "",
    ...props
  },
  ref
) {
  const inputId =
    id ?? props.name ?? `input-${label?.replace(/\s+/g, "-")}`;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error
            ? `${inputId}-error`
            : hint
              ? `${inputId}-hint`
              : undefined
        }
        className={[
          "w-full rounded-xl border bg-white px-4 py-3",
          "text-sm text-ink outline-none transition",
          "placeholder:text-gray-400",
          "focus:border-brand-500 focus:ring-4 focus:ring-brand-100",
          error ? "border-red-400" : "border-gray-200",
          className,
        ].join(" ")}
        {...props}
      />

      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-gray-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;