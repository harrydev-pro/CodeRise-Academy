import { useState } from "react";
import { Save, UserRound } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import { updateUser } from "../../features/users/userStorage";
import { validateEmail, validatePhone } from "../../utils/validators";

export default function Profile() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
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

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!validateEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!validatePhone(form.phone)) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    try {
      updateUser(user.id, {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      });

      setMessage(
        "Profile update requested. If the updated details do not appear after refreshing, the authentication context must also be updated."
      );
    } catch {
      setMessage("Unable to update your profile.");
    }
  }

  return (
    <div className="student-page">
      <div className="student-page-heading">
        <span className="eyebrow">ACCOUNT SETTINGS</span>
        <h1>My Profile</h1>
        <p>Manage your personal information.</p>
      </div>

      <div className="profile-layout">
        <aside className="profile-summary-card">
          <span className="profile-avatar">
            <UserRound size={38} />
          </span>

          <h2>{user?.fullName || "Student"}</h2>

          <p>{user?.email}</p>

          <span className="profile-role">
            {user?.role || "student"}
          </span>
        </aside>

        <section className="student-panel">
          <h2>Personal information</h2>

          <p className="muted-text">
            Keep your account details up to date.
          </p>

          {message && (
            <div className="alert alert-info">{message}</div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Full name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              error={errors.fullName}
              required
            />

            <Input
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <Input
              label="Phone number"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
              required
            />

            <Button type="submit">
              <Save size={17} />
              Save Changes
            </Button>
          </form>

          <div className="alert alert-info profile-demo-notice">
            This prototype stores profile data in your browser. Email
            changes should be verified by a real backend before being
            trusted.
          </div>
        </section>
      </div>
    </div>
  );
}