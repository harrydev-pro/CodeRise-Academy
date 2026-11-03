import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { apiClient } from "../../services/api/client";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const result = await apiClient("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      navigate("/login", { replace: true, state: { message: "Your email is verified. Sign in to continue." } });
    } catch (requestError) {
      setError(requestError.message || "Unable to verify your email.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const result = await apiClient("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!result.ok) setError(result.error);
      else setMessage(result.data?.message || "If the account is eligible, a new code will be sent.");
    } catch (requestError) {
      setError(requestError.message || "Unable to request a new code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-form">
      <div className="auth-heading">
        <span className="auth-icon"><MailCheck size={25} /></span>
        <h1>Verify your email</h1>
        <p>Enter the verification code sent to your email address.</p>
      </div>

      {message && <div className="alert alert-info">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleVerify}>
        <Input label="Email address" name="email" type="email" value={email}
          onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        <Input label="Verification code" name="code" value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric" autoComplete="one-time-code" required />
        <Button type="submit" fullWidth className="mt-4" loading={loading}>Verify email</Button>
      </form>

      <Button variant="outline" fullWidth className="mt-3" disabled={loading} onClick={handleResend}>
        Resend verification code
      </Button>
      <p className="auth-switch"><Link to="/login">Return to sign in</Link></p>
    </div>
  );
}
