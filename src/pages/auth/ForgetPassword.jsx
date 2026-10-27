import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { validateEmail } from "../../utils/validators";

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
      // A real password-reset request must be handled by a backend.
      await new Promise((resolve) => setTimeout(resolve, 400));

      setMessage(
        "Demo mode: no reset email was sent. Password recovery is not connected to a backend."
      );
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

        <Button type="submit" fullWidth loading={loading}>
          Request password reset
        </Button>
      </form>

      <p className="auth-switch">
        Remember your password? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}