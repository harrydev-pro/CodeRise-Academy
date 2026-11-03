import { useState } from "react";
import { Save, UserRound } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone_number || "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

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

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!/^\d{10}$/.test(form.phone)) {
      nextErrors.phone = "Enter a valid 10-digit phone number.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const result = await updateProfile({ fullName: form.fullName.trim(), phone: form.phone.trim() });
    setSaving(false);
    setMessage(result.success ? "Your profile has been updated." : result.message);
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
              readOnly
              autoComplete="email"
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

            <Button type="submit" loading={saving}>
              <Save size={17} />
              Save Changes
            </Button>
          </form>

        </section>
      </div>
    </div>
  );
}
