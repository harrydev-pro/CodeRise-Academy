import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { apiClient } from "../../services/api/client";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    token: new URLSearchParams(window.location.hash.slice(1)).get("token") || "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};

    if (!form.token.trim()) {
      nextErrors.token = "Enter the reset token.";
    }

    if (form.password.length < 8 || form.password.length > 128) {
      nextErrors.password = "Use a password between 8 and 128 characters.";
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Your passwords do not match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const result = await apiClient("/auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify({ token: form.token.trim(), password: form.password }),
      });
      if (!result.ok) setMessage(result.error);
      else navigate("/login", { replace: true, state: { message: "Your password was reset. Sign in with your new password." } });
    } catch (requestError) {
      setMessage(requestError.message || "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
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

        <Button className="mt-5" type="submit" fullWidth loading={loading}>
          Reset password
        </Button>
      </form>

      <p className="auth-switch">
        <Link to="/login">Return to sign in</Link>
      </p>
    </div>
  );
}
