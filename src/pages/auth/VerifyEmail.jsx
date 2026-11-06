import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";

import Button from "../../components/common/Button";
import { apiClient } from "../../services/api/client";

const CODE_LENGTH = 6;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email?.trim().toLowerCase() || "";
  const [code, setCode] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");
  const [error, setError] = useState("");
  const [action, setAction] = useState("");
  const inputs = useRef([]);

  function updateCode(value, focusIndex) {
    const nextCode = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(nextCode);
    if (focusIndex >= 0 && focusIndex < CODE_LENGTH) {
      inputs.current[focusIndex]?.focus();
    }
  }

  function handleDigitChange(index, value) {
    const enteredDigits = value.replace(/\D/g, "");
    if (enteredDigits.length > 1) {
      const digits = code.padEnd(CODE_LENGTH, " ").split("");
      const pastedDigits = enteredDigits.slice(0, CODE_LENGTH - index);
      pastedDigits.split("").forEach((digit, offset) => {
        digits[index + offset] = digit;
      });
      setCode(digits.join("").trimEnd());
      setError("");
      inputs.current[Math.min(index + pastedDigits.length, CODE_LENGTH - 1)]?.focus();
      return;
    }

    const digit = enteredDigits.slice(-1);
    const digits = code.split("");
    digits[index] = digit;
    const nextCode = digits.join("").slice(0, CODE_LENGTH);
    setCode(nextCode);
    setError("");
    if (digit && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      event.preventDefault();
      inputs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      event.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event) {
    const pastedCode = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pastedCode) return;
    event.preventDefault();
    updateCode(pastedCode, Math.min(pastedCode.length, CODE_LENGTH - 1));
    setError("");
  }

  async function handleVerify(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("This verification session has expired. Sign in again to request a new code.");
      return;
    }
    if (code.length !== CODE_LENGTH) {
      setError("Enter all six digits from your verification code.");
      return;
    }

    setAction("verify");
    try {
      const result = await apiClient("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      navigate("/login", {
        replace: true,
        state: { message: "Your email is verified. Sign in to continue." },
      });
    } catch (requestError) {
      setError(requestError.message || "Unable to verify your email.");
    } finally {
      setAction("");
    }
  }

  async function handleResend() {
    if (!email) {
      setError("Sign in again to request a new verification code.");
      return;
    }
    setError("");
    setMessage("");
    setAction("resend");
    try {
      const result = await apiClient("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (!result.ok) {
        setError(result.status === 429
          ? "Too many code requests. Please wait a little before trying again."
          : "We couldn’t send a new code right now. Please try again later.");
      } else {
        setCode("");
        setMessage("If the account is eligible, a new code will be sent to your email.");
        inputs.current[0]?.focus();
      }
    } catch {
      setError("We couldn’t send a new code right now. Please check your connection and try again.");
    } finally {
      setAction("");
    }
  }

  const loading = Boolean(action);

  return (
    <div className="auth-form">
      <div className="auth-heading">
        <span className="auth-icon"><MailCheck size={25} /></span>
        <h1>Verify your email</h1>
        <p>Enter the six-digit verification code sent to your email address.</p>
      </div>

      {message && <div className="alert alert-info" role="status">{message}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {email ? (
        <>
          <form onSubmit={handleVerify} noValidate>
            <div
              className="flex justify-center gap-2 sm:gap-3"
              role="group"
              aria-label="Six-digit verification code"
              onPaste={handlePaste}
            >
              {Array.from({ length: CODE_LENGTH }, (_, index) => (
                <input
                  key={index}
                  ref={(element) => { inputs.current[index] = element; }}
                  aria-label={`Verification code digit ${index + 1}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={index === 0 ? CODE_LENGTH : 1}
                  value={code[index] || ""}
                  onChange={(event) => handleDigitChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  disabled={loading}
                  className="h-12 w-11 rounded-xl border border-gray-200 bg-white text-center text-xl font-semibold text-ink outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 sm:h-14 sm:w-14"
                />
              ))}
            </div>
            <Button type="submit" fullWidth className="mt-5" loading={action === "verify"} disabled={loading}>
              Verify email
            </Button>
          </form>

          <Button variant="outline" fullWidth className="mt-3" loading={action === "resend"} disabled={loading} onClick={handleResend}>
            {action === "resend" ? "Sending a new code…" : "Resend verification code"}
          </Button>
        </>
      ) : (
        <>
          <div className="alert alert-info" role="status">
            Sign in again to request a verification code.
          </div>
          <p className="auth-switch"><Link to="/login">Return to sign in</Link></p>
        </>
      )}

      {email && <p className="auth-switch"><Link to="/login">Return to sign in</Link></p>}
    </div>
  );
}
