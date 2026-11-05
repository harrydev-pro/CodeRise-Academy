import { useState } from "react";
import { Camera, KeyRound, Mail, Save, UserRound } from "lucide-react";

import Button from "../../components/common/Button";
import { Notice, PageHeader, TextField } from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { api, uploadFile } from "../../services/api/api";
import { useAuthStore } from "../../store/authStore";
import { validateEmail, validatePhone } from "../../utils/validators";

function fieldErrors(error) {
  return Object.fromEntries((error?.data?.errors || []).map((item) => [item.field, item.message]));
}

function ProfileDetails({ user, updateProfile }) {
  const [form, setForm] = useState({ fullName: user?.fullName || user?.name || "", phone: user?.phone_number || "" });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function save(extra = {}) {
    const next = {};
    if (form.fullName.trim().length < 3) next.fullName = "Enter your full name (at least 3 characters).";
    if (!validatePhone(form.phone)) next.phone = "Enter a valid Nigerian phone number.";
    setErrors(next);
    if (Object.keys(next).length) return false;
    setSaving(true);
    const result = await updateProfile({ fullName: form.fullName.trim(), phone: form.phone.trim(), ...extra });
    setSaving(false);
    setNotice(result.success ? { tone: "info", text: "Your profile has been updated." } : { tone: "error", text: result.message });
    return result.success;
  }

  async function handleAvatar(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setNotice(null);
    try {
      const uploaded = await uploadFile(file, "avatar");
      await save({ avatarUrl: uploaded.url });
    } catch (error) {
      setNotice({ tone: "error", text: error.message || "The image could not be uploaded." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="ui-card">
      <h2><UserRound size={19} aria-hidden="true" /> Personal information</h2>
      <div className="profile-avatar-row">
        {user?.avatar_url ? <img src={user.avatar_url} alt="" className="dashboard-avatar" /> : <span className="dashboard-avatar">{(form.fullName || "S").charAt(0).toUpperCase()}</span>}
        <div className="ui-actions">
          <label className="btn btn-outline btn-sm">
            <Camera size={16} aria-hidden="true" /> {uploading ? "Uploading…" : "Change photo"}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleAvatar} disabled={uploading} />
          </label>
          {user?.avatar_url && <button type="button" className="btn btn-ghost btn-sm" onClick={() => save({ avatarUrl: "" })}>Remove photo</button>}
        </div>
      </div>
      <Notice tone={notice?.tone}>{notice?.text}</Notice>
      <form className="ui-form" onSubmit={(event) => { event.preventDefault(); save(); }} noValidate>
        <div className="ui-form-grid">
          <TextField label="Full name" value={form.fullName} onChange={(value) => setForm((f) => ({ ...f, fullName: value }))} error={errors.fullName} autoComplete="name" required />
          <TextField label="Phone number" type="tel" value={form.phone} onChange={(value) => setForm((f) => ({ ...f, phone: value }))} error={errors.phone} autoComplete="tel" required />
        </div>
        <div className="ui-form-actions"><Button type="submit" loading={saving}><Save size={17} aria-hidden="true" /> Save changes</Button></div>
      </form>
    </section>
  );
}

function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const next = {};
    if (!form.currentPassword) next.currentPassword = "Enter your current password.";
    if (form.newPassword.length < 8) next.newPassword = "Use at least 8 characters.";
    if (form.newPassword !== form.confirm) next.confirm = "The passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setNotice(null);
    try {
      const result = await api.post("/auth/change-password", { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
      setNotice({ tone: "info", text: result.message || "Your password has been changed." });
    } catch (error) {
      setErrors(fieldErrors(error));
      setNotice({ tone: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="ui-card">
      <h2><KeyRound size={19} aria-hidden="true" /> Change password</h2>
      <p className="muted-text">Changing your password signs you out on your other devices.</p>
      <Notice tone={notice?.tone}>{notice?.text}</Notice>
      <form className="ui-form" onSubmit={submit} noValidate>
        <TextField label="Current password" type="password" value={form.currentPassword} onChange={(value) => setForm((f) => ({ ...f, currentPassword: value }))} error={errors.currentPassword} autoComplete="current-password" />
        <div className="ui-form-grid">
          <TextField label="New password" type="password" value={form.newPassword} onChange={(value) => setForm((f) => ({ ...f, newPassword: value }))} error={errors.newPassword} autoComplete="new-password" />
          <TextField label="Confirm new password" type="password" value={form.confirm} onChange={(value) => setForm((f) => ({ ...f, confirm: value }))} error={errors.confirm} autoComplete="new-password" />
        </div>
        <div className="ui-form-actions"><Button type="submit" loading={saving}>Change password</Button></div>
      </form>
    </section>
  );
}

function ChangeEmail({ user, onChanged }) {
  const [step, setStep] = useState(user?.pending_email ? "code" : "request");
  const [form, setForm] = useState({ newEmail: user?.pending_email || "", password: "", code: "" });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);

  async function request(event) {
    event.preventDefault();
    const next = {};
    if (!validateEmail(form.newEmail)) next.newEmail = "Enter a valid email address.";
    if (!form.password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setNotice(null);
    try {
      const result = await api.post("/auth/change-email", { newEmail: form.newEmail.trim().toLowerCase(), password: form.password });
      setStep("code");
      setForm((f) => ({ ...f, password: "" }));
      setNotice({ tone: "info", text: result.message });
    } catch (error) {
      setErrors(fieldErrors(error));
      setNotice({ tone: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function confirm(event) {
    event.preventDefault();
    if (!/^\d{6}$/.test(form.code)) {
      setErrors({ code: "Enter the 6-digit code." });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      await api.post("/auth/change-email/confirm", { code: form.code });
      setNotice({ tone: "info", text: "Your email address has been updated." });
      setStep("request");
      setForm({ newEmail: "", password: "", code: "" });
      onChanged();
    } catch (error) {
      setNotice({ tone: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="ui-card">
      <h2><Mail size={19} aria-hidden="true" /> Email address</h2>
      <p className="muted-text">Current email: <strong>{user?.email}</strong></p>
      <Notice tone={notice?.tone}>{notice?.text}</Notice>
      {step === "request" ? (
        <form className="ui-form" onSubmit={request} noValidate>
          <div className="ui-form-grid">
            <TextField label="New email address" type="email" inputMode="email" value={form.newEmail} onChange={(value) => setForm((f) => ({ ...f, newEmail: value }))} error={errors.newEmail} autoComplete="email" />
            <TextField label="Your password" type="password" value={form.password} onChange={(value) => setForm((f) => ({ ...f, password: value }))} error={errors.password} autoComplete="current-password" />
          </div>
          <div className="ui-form-actions"><Button type="submit" variant="outline" loading={saving}>Send confirmation code</Button></div>
        </form>
      ) : (
        <form className="ui-form" onSubmit={confirm} noValidate>
          <TextField label={`Code sent to ${form.newEmail || user?.pending_email}`} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={form.code} onChange={(value) => setForm((f) => ({ ...f, code: value.replace(/\D/g, "") }))} error={errors.code} />
          <div className="ui-form-actions">
            <Button type="button" variant="ghost" onClick={() => setStep("request")}>Use a different email</Button>
            <Button type="submit" loading={saving}>Confirm new email</Button>
          </div>
        </form>
      )}
    </section>
  );
}

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const initialize = useAuthStore((state) => state.initialize);
  return (
    <div className="student-page">
      <PageHeader eyebrow="ACCOUNT SETTINGS" title="My Profile" description="Manage your personal information and sign-in details." />
      <div className="ui-grid profile-grid">
        <ProfileDetails user={user} updateProfile={updateProfile} />
        <ChangeEmail user={user} onChanged={initialize} />
        <ChangePassword />
      </div>
    </div>
  );
}
