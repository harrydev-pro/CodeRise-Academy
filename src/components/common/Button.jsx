import { forwardRef } from "react";
import { LoaderCircle } from "lucide-react";

const Button = forwardRef(function Button(
  {
    as: Component = "button",
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    disabled = false,
    className = "",
    type = "button",
    ...props
  },
  ref
) {
  const classes = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? "btn-full" : "",
    loading ? "btn-loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      type={Component === "button" ? type : undefined}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <LoaderCircle className="btn-spinner" size={17} />
      )}

      {children}
    </Component>
  );
});

export default Button;