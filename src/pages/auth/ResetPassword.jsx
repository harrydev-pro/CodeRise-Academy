import { useState } from "react";
import { Link } from "react-router-dom";
import { LockKeyhole } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

export default function ResetPassword() {
  const [form, setForm] = useState({
    token: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};

    if (!form.token.trim()) {
      nextErrors.token = "Enter the reset token.";
    }

    if (form.password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Your passwords do not match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setMessage(
      "Password reset is not connected. No password has been changed."
    );
  }

  return (
    <div className="auth-form">
      <div className="auth-heading">
        <span className="auth-icon">
          <LockKeyhole size={25} />
        </span>

        <h1>Reset your password</h1>

        <p>Enter your reset token and choose a new password.</p>
      </div>

      <div className="alert alert-info">
        Demo mode: a valid reset token can only be issued by a connected
        backend. This page will not change your account password.
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleSubmit}>
        <Input
          label="Reset token"
          name="token"
          value={form.token}
          onChange={handleChange}
          placeholder="Enter your reset token"
          error={errors.token}
          required
        />

        <Input
          label="New password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="At least 8 characters"
          error={errors.password}
          autoComplete="new-password"
          required
        />

        <Input
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Enter the new password again"
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />

        <Button type="submit" fullWidth>
          Reset password
        </Button>
      </form>

      <p className="auth-switch">
        <Link to="/login">Return to sign in</Link>
      </p>
    </div>
  );
}