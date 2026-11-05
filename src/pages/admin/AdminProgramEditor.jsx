import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { CheckboxField, ImageField, ListField, Notice, PageHeader, TextArea, TextField } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { api } from "../../services/api/api";

const LISTS = [
  ["curriculum", "Curriculum / what students will learn", "One topic or module per line."],
  ["objectives", "Learning objectives"], ["skills", "Skills students will gain"], ["projects", "Practical projects"],
  ["benefits", "Program benefits"], ["features", "Program features"], ["resources", "Learning resources"],
];

function toForm(program) {
  return {
    title: program?.title || "", description: program?.description || "", overview: program?.overview || "",
    category: program?.category || "", level: program?.level || "", duration: program?.duration || "",
    originalPrice: program?.originalPrice ?? "", promotionalPrice: program?.promotionalPrice ?? "",
    imageUrl: program?.imageUrl || "", published: program?.published ?? false, order: program?.order ?? 0,
    ...Object.fromEntries(LISTS.map(([key]) => [key, (program?.[key] || []).map((item) => (typeof item === "string" ? item : item.title))])),
  };
}

function Editor({ program }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => toForm(program));
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  async function save(event) {
    event.preventDefault();
    const next = {};
    if (form.title.trim().length < 2) next.title = "Enter a title.";
    const price = Number(form.originalPrice);
    if (form.originalPrice === "" || !Number.isInteger(price) || price < 0) next.originalPrice = "Enter the price in naira, as a whole number.";
    const promo = form.promotionalPrice === "" ? null : Number(form.promotionalPrice);
    if (promo !== null && (!Number.isInteger(promo) || promo < 0 || promo >= price)) next.promotionalPrice = "Leave empty, or enter a whole number lower than the price.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const body = {
      title: form.title.trim(), description: form.description.trim(), overview: form.overview.trim(), category: form.category.trim(),
      level: form.level.trim(), duration: form.duration.trim(), originalPrice: price, promotionalPrice: promo,
      imageUrl: form.imageUrl.trim(), published: form.published, order: Number(form.order) || 0,
      ...Object.fromEntries(LISTS.map(([key]) => [key, form[key]])),
    };
    setSaving(true);
    setNotice(null);
    try {
      const saved = program ? await api.patch(`/admin/programs/${program.id}`, body, "program") : await api.post("/admin/programs", body, "program");
      setNotice({ tone: "info", text: "Program saved." });
      if (!program) navigate(`/admin/programs/${saved.id}`, { replace: true });
    } catch (error) {
      setErrors(Object.fromEntries((error.data?.errors || []).map((item) => [item.field, item.message])));
      setNotice({ tone: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Remove "${program.title}"? Programs with applications are archived (hidden) instead, so their records are kept.`)) return;
    try {
      const result = await api.delete(`/admin/programs/${program.id}`);
      window.alert(result.message || "Program deleted.");
      navigate("/admin/programs");
    } catch (error) {
      setNotice({ tone: "error", text: error.message });
    }
  }

  return (
    <form className="ui-form" onSubmit={save} noValidate>
      <Notice tone={notice?.tone}>{notice?.text}</Notice>
      <div className="ui-card ui-form">
        <h2>Basics</h2>
        <TextField label="Title" value={form.title} onChange={set("title")} error={errors.title} required />
        <TextArea label="Short description" rows={2} value={form.description} onChange={set("description")} error={errors.description} hint="Shown on the program card." />
        <TextArea label="Overview" rows={5} value={form.overview} onChange={set("overview")} hint="Shown on the program details page." />
        <div className="ui-form-grid">
          <TextField label="Category" value={form.category} onChange={set("category")} />
          <TextField label="Level" value={form.level} onChange={set("level")} />
          <TextField label="Duration" value={form.duration} onChange={set("duration")} placeholder="For example: 12 weeks" hint="Leave empty to show “To be announced”." />
        </div>
      </div>
      <div className="ui-card ui-form">
        <h2>Price</h2>
        <div className="ui-form-grid">
          <TextField label="Price (₦)" type="number" inputMode="numeric" min="0" step="1" value={form.originalPrice} onChange={set("originalPrice")} error={errors.originalPrice} required />
          <TextField label="Discounted price (₦, optional)" type="number" inputMode="numeric" min="0" step="1" value={form.promotionalPrice} onChange={set("promotionalPrice")} error={errors.promotionalPrice} />
        </div>
      </div>
      <div className="ui-card ui-form">
        <h2>Image</h2>
        <ImageField value={form.imageUrl} onChange={set("imageUrl")} />
      </div>
      <div className="ui-card ui-form">
        <h2>Details page content</h2>
        <p className="ui-hint">Empty sections are hidden from students.</p>
        <div className="ui-form-grid">
          {LISTS.map(([key, label, hint]) => <ListField key={key} label={label} hint={hint} value={form[key]} onChange={set(key)} rows={key === "curriculum" ? 8 : 4} />)}
        </div>
      </div>
      <div className="ui-card ui-form">
        <h2>Visibility</h2>
        <CheckboxField label="Published" hint="Published programs appear on the website." checked={form.published} onChange={set("published")} />
        <TextField label="Display order" type="number" inputMode="numeric" value={form.order} onChange={set("order")} hint="Lower numbers appear first." />
      </div>
      <div className="ui-form-actions">
        {program && <Button type="button" variant="ghost" className="btn-danger-text" onClick={remove}>Delete program</Button>}
        <Button type="submit" loading={saving}>Save program</Button>
      </div>
    </form>
  );
}

export default function AdminProgramEditor() {
  const { programId } = useParams();
  const isNew = programId === "new";
  const { data: program, loading, error, reload } = useApiResource(`/admin/programs/${encodeURIComponent(programId)}`, "program", null, !isNew);
  return (
    <section className="admin-page">
      <Link to="/admin/programs" className="back-link"><ArrowLeft size={17} aria-hidden="true" /> All programs</Link>
      <PageHeader eyebrow="CATALOG" title={isNew ? "New program" : program?.title || "Edit program"} description={isNew ? "New programs start as drafts until you publish them." : program && `${program.applicationCount} applications`} />
      {!isNew && loading ? <Loader label="Loading program…" /> : !isNew && error ? <ErrorMessage message={error} onRetry={reload} /> : <Editor key={program?.id || "new"} program={isNew ? null : program} />}
    </section>
  );
}
