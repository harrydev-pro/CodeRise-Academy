import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";

import Button from "../../components/common/Button";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  function handleVerify(event) {
    event.preventDefault();

    setMessage(
      "Email verification is not connected yet. No verification email has been sent."
    );
  }

  return (
    <div className="auth-form">
      <div className="auth-heading">
        <span className="auth-icon">
          <MailCheck size={25} />
        </span>

        <h1>Verify your email</h1>

        <p>
          {email
            ? `Your account was created using ${email}.`
            : "Check your email for a verification code."}
        </p>
      </div>

      <div className="alert alert-info">
        Demo mode: CodeRise Academy has not sent an email. Real email
        verification requires a backend and email service.
      </div>

      {message && <div className="alert alert-error">{message}</div>}

      <form onSubmit={handleVerify}>
        <label className="field-label" htmlFor="verificationCode">
          Verification code
        </label>

        <input
          id="verificationCode"
          className="form-input"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, ""))
          }
          placeholder="Enter 6-digit code"
        />

        <Button type="submit" fullWidth className="mt-4">
          Verify email
        </Button>
      </form>

      <Button
        variant="outline"
        fullWidth
        className="mt-3"
        onClick={() => navigate("/dashboard")}
      >
        Continue to dashboard (demo)
      </Button>

      <p className="auth-switch">
        <Link to="/login">Return to sign in</Link>
      </p>
    </div>
  );
}