import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import { validateEmail, validatePhone } from "../../utils/validators";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setMessage("");
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Enter your full name.";
    }

    if (!validateEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!validatePhone(form.phone)) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (form.password.length < 8) {
      nextErrors.password =
        "Your password must contain at least 8 characters.";
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Your passwords do not match.";
    }

    if (!form.acceptedTerms) {
      nextErrors.acceptedTerms =
        "You must accept the terms before creating an account.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      });

      if (result?.success === false) {
        setMessage(result.message || "Unable to create your account.");
        return;
      }

      navigate("/verify-email", {
        replace: true,
        state: {
          email: form.email.trim().toLowerCase(),
        },
      });
    } catch (error) {
      setMessage(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-form">
      <div className="auth-heading">
        <span className="auth-icon">
          <UserPlus size={25} />
        </span>

        <h1>Create your account</h1>

        <p>
          Join CodeRise Academy and start building your technology skills.
        </p>
      </div>

      {message && <div className="alert alert-error">{message}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Full name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          error={errors.fullName}
          autoComplete="name"
          required
        />

        <Input
          label="Email address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          error={errors.email}
          autoComplete="email"
          required
        />

        <Input
          label="Phone number"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="08012345678"
          error={errors.phone}
          autoComplete="tel"
          required
        />

        <div className="password-field">
          <Input
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            error={errors.password}
            autoComplete="new-password"
            required
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Enter your password again"
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="acceptedTerms"
            checked={form.acceptedTerms}
            onChange={handleChange}
          />

          <span>
            I agree to the CodeRise Academy terms and privacy policy.
          </span>
        </label>

        {errors.acceptedTerms && (
          <p className="field-error">{errors.acceptedTerms}</p>
        )}

        <Button type="submit" fullWidth loading={loading}>
          Create account
        </Button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}