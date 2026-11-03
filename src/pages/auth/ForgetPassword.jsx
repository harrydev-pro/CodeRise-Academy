import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { validateEmail } from "../../utils/validators";
import { apiClient } from "../../services/api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiClient("/auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!result.ok) setError(result.error);
      else setMessage(result.data?.message || "If an account matches that address, reset instructions have been sent.");
    } catch (requestError) {
      setError(requestError.message || "Unable to request a password reset.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-form">
      <div className="auth-heading">
        <span className="auth-icon">
          <Mail size={25} />
        </span>

        <h1>Forgot your password?</h1>

        <p>
          Enter your registered email address to begin the password recovery
          process.
        </p>
      </div>

      {message && <div className="alert alert-info">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email address"
          name="email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError("");
            setMessage("");
          }}
          placeholder="you@example.com"
          error={error}
          autoComplete="email"
          required
        />

        <Button className="mt-5" type="submit" fullWidth loading={loading}>
          Request password reset
        </Button>
      </form>

      <p className="auth-switch">
        Remember your password? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
