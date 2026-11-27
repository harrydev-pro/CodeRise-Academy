import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import {
  ANNOUNCEMENT_CATEGORIES,
  cancelScheduledAnnouncement,
  deleteAnnouncement,
  emptyAnnouncement,
  getAdminAnnouncements,
  pinAnnouncement,
  saveAnnouncement,
  uploadAnnouncementImage,
} from "../../../../features/community/admin/manage/adminManageService";
import { ConfirmDialog, Field, SampleNotice, StatusTabs, Switch } from "../../../../features/community/admin/manage/manageControls";
import {
  dayMonth, isHttpsUrl, isoToWatInput, numberFormat, relativeDays, useToastState, watDateTime, watInputToIso,
} from "../../../../features/community/admin/manage/manageUtils";
import { useCommunityList } from "../../../../features/community/listHooks";

const STATUS = {
  published: { label: "Published", tone: "green" },
  scheduled: { label: "Scheduled", tone: "blue" },
  draft: { label: "Draft", tone: "amber" },
};
const MB = 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const NO_FILTERS = {};

function audienceText(audience, options, totalMembers) {
  switch (audience?.type) {
    case "premium": return "Premium & Premium Plus students";
    case "free": return "Free students";
    case "category": return `Category: ${audience.value ?? "—"}`;
    case "event": {
      const event = options?.events?.find((item) => item.id === audience.value);
      return event ? `${event.title} participants (${numberFormat.format(event.participants)})` : "Event participants";
    }
    default: return `All students${totalMembers ? ` (${numberFormat.format(totalMembers)})` : ""}`;
  }
}

export default function AdminCommunityAnnouncements() {
  const { data, error, loading, refreshing, reload } = useCommunityList(getAdminAnnouncements, NO_FILTERS);
  const [params, setParams] = useSearchParams();
  const startNew = params.get("new") === "1";
  const [tab, setTab] = useState("all");
  // editing: an announcement id, "new", or null (nothing open). ?new=1 opens a blank editor.
  const [chosen, setChosen] = useState(null);
  const [editorKey, setEditorKey] = useState(0);
  const [busyRow, setBusyRow] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [toast, setToast, closeToast] = useToastState();
  const editorRef = useRef(null);

  const list = data?.announcements ?? [];
  const sample = Boolean(data?.isSample);
  const editing = startNew ? "new" : chosen ?? list[0]?.id ?? "new";
  const current = editing === "new" ? null : list.find((item) => item.id === editing);
  const counts = { all: list.length, published: 0, scheduled: 0, draft: 0 };
  list.forEach((item) => { counts[item.status] += 1; });
  const shown = tab === "all" ? list : list.filter((item) => item.status === tab);

  function clearNew() {
    if (startNew) setParams((currentParams) => { const next = new URLSearchParams(currentParams); next.delete("new"); return next; }, { replace: true });
  }

  function open(id) {
    clearNew();
    setChosen(id);
    setEditorKey((value) => value + 1);
    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 1099px)").matches) editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      editorRef.current?.querySelector("input, textarea")?.focus({ preventScroll: true });
    });
  }

  async function rowAction(id, work, message) {
    setBusyRow(id);
    try {
      await work();
      setToast({ type: "success", message });
      reload();
    } catch (actionError) {
      setToast({ type: "error", message: actionError.message || "That didn't work. Please try again." });
    } finally {
      setBusyRow("");
    }
  }

  async function confirmDelete() {
    setDeleteBusy(true);
    try {
      await deleteAnnouncement(toDelete.id, { sample });
      setToast({ type: "success", message: `“${toDelete.title || "Untitled"}” deleted.` });
      if (editing === toDelete.id) setChosen("new");
      setToDelete(null);
      reload();
    } catch (deleteError) {
      setToast({ type: "error", message: deleteError.message || "The announcement could not be deleted." });
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <section className="admin-page community-admin cam-page">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMMUNITY MANAGEMENT</span>
          <h1>Announcements</h1>
          <p>Publish updates to the whole community or to a specific audience.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => open("new")}><Plus size={17} aria-hidden="true" /> New announcement</button>
      </header>

      {sample && <SampleNotice>Changes are kept in this browser tab only, nothing is sent to students, and uploads stay on this computer.</SampleNotice>}
      {loading && <Loader label="Loading announcements…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <div className="cam-split">
          <div className={`cam-split-main${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing}>
            <StatusTabs
              label="Filter announcements"
              value={tab}
              onChange={setTab}
              tabs={[
                { value: "all", label: "All", count: counts.all },
                { value: "published", label: "Published", count: counts.published },
                { value: "scheduled", label: "Scheduled", count: counts.scheduled },
                { value: "draft", label: "Drafts", count: counts.draft },
              ]}
            />
            {shown.length === 0 ? (
              <div className="community-card community-empty">
                <h2>No announcements here</h2>
                <p className="muted-text">Nothing in this tab yet.</p>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => open("new")}>New announcement</button>
              </div>
            ) : (
              <ul className="cam-announcement-list">
                {shown.map((item) => (
                  <AnnouncementRow
                    key={item.id}
                    item={item}
                    active={item.id === editing}
                    audience={audienceText(item.audience, data.audienceOptions, data.totalMembers)}
                    busy={busyRow === item.id}
                    onEdit={() => open(item.id)}
                    onPin={() => rowAction(item.id, () => pinAnnouncement(item.id, !item.pinned, { sample }), item.pinned ? "Unpinned." : "Pinned to the top of announcements.")}
                    onCancel={() => rowAction(item.id, () => cancelScheduledAnnouncement(item.id, { sample }), "Schedule cancelled. The announcement is back in Drafts.")}
                    onDelete={() => setToDelete(item)}
                  />
                ))}
              </ul>
            )}
          </div>

          <div ref={editorRef} className="cam-split-side">
            <AnnouncementEditor
              key={`${editing}-${editorKey}-${current ? "loaded" : "blank"}`}
              initial={current ?? emptyAnnouncement()}
              options={data.audienceOptions}
              sample={sample}
              onSaved={(saved, message) => { clearNew(); setChosen(saved.id); setToast({ type: "success", message }); reload(); }}
              onError={setToast}
              onDelete={current ? () => setToDelete(current) : null}
              onClose={() => open(list[0]?.id ?? "new")}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete “${toDelete?.title || "Untitled"}”?`}
        icon={<Trash2 size={22} />}
        danger
        confirmLabel="Delete announcement"
        busyLabel="Deleting…"
        busy={deleteBusy}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      >
        <p>{toDelete?.status === "published" ? "Students will no longer see it in Community announcements. Emails already sent can't be recalled." : "This draft will be removed."} This cannot be undone.</p>
      </ConfirmDialog>
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

function AnnouncementRow({ item, active, audience, busy, onEdit, onPin, onCancel, onDelete }) {
  const status = STATUS[item.status] ?? STATUS.draft;
  const date = item.status === "published" ? dayMonth.format(new Date(item.publishedAt))
    : item.status === "scheduled" ? `Created ${dayMonth.format(new Date(item.updatedAt))}`
      : `Edited ${relativeDays(item.updatedAt)}`;
  const reach = item.status === "published" && typeof item.reached === "number"
    ? ` · ${numberFormat.format(item.reached)} reached${typeof item.openedRate === "number" && item.audience?.type === "all" ? ` · ${item.openedRate}% opened` : ""}`
    : "";
  return (
    <li className={`community-card cam-announcement${active ? " is-active" : ""}`}>
      <div className="cam-announcement-top">
        <span className="community-tags">
          <span className={`community-tag tag-${status.tone}`}>{status.label}{item.status === "scheduled" && item.scheduledAt ? ` · ${watDateTime(item.scheduledAt).replace(/ \d{4},/, ",")}` : ""}</span>
          {item.pinned && <span className="community-tag tag-blue">Pinned</span>}
          {active && <span className="community-tag tag-neutral">Editing</span>}
        </span>
        <span className="cam-muted-small">{date}</span>
      </div>
      <h2 className="cam-announcement-title">{item.title || "Untitled announcement"}</h2>
      <div className="cam-announcement-foot">
        <p className="cam-muted-small">{audience}{reach}</p>
        {!active && (
          <div className="cam-row-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={onEdit} aria-label={`Edit ${item.title || "untitled announcement"}`}>Edit</button>
            {item.status === "published" && (
              <button type="button" className="btn btn-outline btn-sm" onClick={onPin} disabled={busy}>{item.pinned ? "Unpin" : "Pin"}</button>
            )}
            {item.status === "scheduled" && (
              <button type="button" className="btn btn-outline btn-sm community-btn-danger-outline" onClick={onCancel} disabled={busy}>Cancel<span className="sr-only"> schedule</span></button>
            )}
            {item.status !== "scheduled" && (
              <button type="button" className="btn btn-outline btn-sm community-btn-danger-outline" onClick={onDelete} disabled={busy}>Delete</button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

const FIELD_ORDER = ["title", "body", "category", "link", "audience", "scheduledAt"];

function validate(form, publishing) {
  const errors = {};
  if (!form.title.trim()) errors.title = "Give the announcement a title.";
  else if (form.title.trim().length > 120) errors.title = "Keep the title under 120 characters.";
  if (form.link.trim() && !isHttpsUrl(form.link.trim())) errors.link = "Enter a full link starting with https://";
  if (!publishing) return errors;
  if (!form.body.trim()) errors.body = "Write the message students will read.";
  if (!form.category) errors.category = "Choose a category.";
  if (["category", "event"].includes(form.audience.type) && !form.audience.value) errors.audience = "Choose which students should receive it.";
  if (form.schedule) {
    const iso = watInputToIso(form.schedule);
    if (!iso) errors.scheduledAt = "Enter a valid date and time.";
    else if (new Date(iso).getTime() < Date.now() + 5 * 60000) errors.scheduledAt = "Choose a time at least 5 minutes from now, or leave it empty to publish now.";
  }
  return errors;
}

function AnnouncementEditor({ initial, options, sample, onSaved, onError, onDelete, onClose }) {
  const isNew = !initial.id;
  const [form, setForm] = useState(() => ({ ...initial, link: initial.link ?? "", imageUrl: initial.imageUrl ?? "", schedule: isoToWatInput(initial.scheduledAt) }));
  const [saved, setSaved] = useState(() => JSON.stringify(form));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState("");
  const [uploading, setUploading] = useState(false);
  const dirty = JSON.stringify(form) !== saved;
  const isPublished = initial.status === "published";

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    if (errors[field]) setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  };
  const setAudience = (type, value) => set("audience", { type, value: value ?? (type === "category" ? options.categories[0] : type === "event" ? options.events[0]?.id : undefined) });

  async function submit(kind) {
    const publishing = kind === "publish";
    const found = validate(form, publishing);
    if (Object.values(found).some(Boolean)) {
      setErrors(found);
      const first = FIELD_ORDER.find((field) => found[field]);
      window.requestAnimationFrame(() => document.getElementById(`ann-${first}`)?.focus());
      return;
    }
    setErrors({});
    setBusy(kind);
    const scheduledAt = publishing ? watInputToIso(form.schedule) : null;
    const status = !publishing ? (isPublished ? "published" : "draft") : scheduledAt ? "scheduled" : "published";
    const rest = { ...form };
    delete rest.schedule;
    try {
      const result = await saveAnnouncement({ ...rest, title: rest.title.trim(), link: rest.link.trim(), status, scheduledAt: status === "scheduled" ? scheduledAt : null }, { sample });
      const message = status === "scheduled" ? `Scheduled for ${watDateTime(scheduledAt)}.`
        : publishing && !isPublished ? "Published. Students in this audience can see it now."
          : isPublished ? "Changes saved." : "Draft saved.";
      setSaved(JSON.stringify(form));
      onSaved(result?.announcement ?? result, message);
    } catch (saveError) {
      onError({ type: "error", message: saveError.message || "The announcement could not be saved." });
    } finally {
      setBusy("");
    }
  }

  async function upload(file) {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) { onError({ type: "error", message: `${file.name} isn't a PNG or JPG image.` }); return; }
    if (file.size > 5 * MB) { onError({ type: "error", message: `${file.name} is larger than 5 MB.` }); return; }
    setUploading(true);
    try {
      const result = await uploadAnnouncementImage(file, { sample });
      set("imageUrl", result.url);
    } catch (uploadError) {
      onError({ type: "error", message: uploadError.message || "The upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  }

  const errorList = FIELD_ORDER.filter((field) => errors[field]);
  const publishLabel = form.schedule ? "Schedule" : isPublished ? "Update" : "Publish now";

  return (
    <form className="ui-card cam-editor" aria-labelledby="ann-editor-title" noValidate onSubmit={(event) => { event.preventDefault(); submit("publish"); }}>
      <div className="ui-card-header">
        <h2 id="ann-editor-title">{isNew ? "New announcement" : "Edit announcement"}</h2>
        <span className="cam-muted-small" aria-live="polite">{dirty ? "Unsaved changes" : isNew ? "Not saved yet" : "Saved"}</span>
        {isNew && <button type="button" className="community-icon-button cam-editor-close" aria-label="Close the new announcement" onClick={onClose}><X size={16} aria-hidden="true" /></button>}
      </div>

      {errorList.length > 1 && (
        <div className="community-error-summary" role="alert">
          <strong>Fix these {errorList.length} things first:</strong>
          <ul>{errorList.map((field) => <li key={field}><a href={`#ann-${field}`}>{errors[field]}</a></li>)}</ul>
        </div>
      )}

      <Field id="ann-title" label="Title" error={errors.title}>
        {(props) => <input {...props} className="ui-input" maxLength={140} value={form.title} onChange={(event) => set("title", event.target.value)} />}
      </Field>
      <Field id="ann-body" label="Message" error={errors.body}>
        {(props) => <textarea {...props} className="ui-input" rows={5} value={form.body} onChange={(event) => set("body", event.target.value)} />}
      </Field>
      <Field id="ann-category" label="Category" error={errors.category}>
        {(props) => (
          <select {...props} className="ui-input" value={form.category} onChange={(event) => set("category", event.target.value)}>
            <option value="">Choose a category</option>
            {ANNOUNCEMENT_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        )}
      </Field>

      <div className="community-field">
        <span className="community-field-label"><span className="cam-label">Cover image</span><span className="community-field-optional">(optional)</span></span>
        {form.imageUrl ? (
          <div className="community-thumb-preview">
            <img src={form.imageUrl} alt="Announcement cover" />
            <div className="cam-row-actions">
              <label className="btn btn-outline btn-sm">Replace image<input type="file" className="sr-only" accept={IMAGE_TYPES.join(",")} onChange={(event) => { upload(event.target.files[0]); event.target.value = ""; }} /></label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => set("imageUrl", "")}>Remove</button>
            </div>
          </div>
        ) : (
          <label className="community-dropzone">
            <ImagePlus size={22} aria-hidden="true" />
            <strong>{uploading ? "Uploading…" : <>Upload image or <span>browse</span></>}</strong>
            <span>PNG or JPG, 1200 × 630 recommended, max 5 MB</span>
            <input type="file" className="sr-only" accept={IMAGE_TYPES.join(",")} disabled={uploading} onChange={(event) => { upload(event.target.files[0]); event.target.value = ""; }} />
          </label>
        )}
      </div>

      <Field id="ann-link" label="External link" optional error={errors.link}>
        {(props) => <input {...props} type="url" inputMode="url" className="ui-input" placeholder="https://" value={form.link} onChange={(event) => set("link", event.target.value)} />}
      </Field>

      <fieldset className="community-fieldset" id="ann-audience" tabIndex={-1} aria-describedby={errors.audience ? "ann-audience-error" : undefined}>
        <legend>Audience</legend>
        <div className="cam-radio-list">
          {[
            { type: "all", label: "All students" },
            { type: "premium", label: "Premium students" },
            { type: "free", label: "Free students" },
          ].map((option) => (
            <label key={option.type} className={`cam-radio${form.audience.type === option.type ? " is-checked" : ""}`}>
              <input type="radio" name="ann-audience" checked={form.audience.type === option.type} onChange={() => setAudience(option.type)} />
              <span>{option.label}</span>
            </label>
          ))}
          <div className={`cam-radio${form.audience.type === "category" ? " is-checked" : ""}`}>
            <label><input type="radio" name="ann-audience" checked={form.audience.type === "category"} onChange={() => setAudience("category")} /><span>Course category</span></label>
            <select className="ui-input" aria-label="Course category" value={form.audience.type === "category" ? form.audience.value : options.categories[0]} onChange={(event) => setAudience("category", event.target.value)}>
              {options.categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className={`cam-radio${form.audience.type === "event" ? " is-checked" : ""}`}>
            <label><input type="radio" name="ann-audience" checked={form.audience.type === "event"} onChange={() => setAudience("event")} /><span>Competition / hackathon participants</span></label>
            <select className="ui-input" aria-label="Competition or hackathon" value={form.audience.type === "event" ? form.audience.value : options.events[0]?.id} onChange={(event) => setAudience("event", event.target.value)}>
              {options.events.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </div>
        </div>
        {errors.audience && <p id="ann-audience-error" className="field-error">{errors.audience}</p>}
      </fieldset>

      {!isPublished && (
        <Field id="ann-scheduledAt" label="Schedule (WAT)" hint="Leave empty to publish immediately." error={errors.scheduledAt}>
          {(props) => <input {...props} type="datetime-local" className="ui-input" value={form.schedule} onChange={(event) => set("schedule", event.target.value)} />}
        </Field>
      )}

      <div className="cam-switch-row">
        <span id="ann-pin-label">Pin to top of announcements</span>
        <Switch checked={form.pinned} onChange={(value) => set("pinned", value)} label="Pin to top of announcements" />
      </div>
      <div className="cam-switch-row">
        <span id="ann-email-label">Also send by email</span>
        <Switch checked={form.sendEmail} onChange={(value) => set("sendEmail", value)} label="Also send by email" disabled={isPublished} />
      </div>

      <div className="cam-editor-actions">
        {onDelete && initial.status !== "scheduled" && (
          <button type="button" className="btn btn-outline community-btn-danger-outline" onClick={onDelete} disabled={Boolean(busy)}>Delete</button>
        )}
        {!isPublished && (
          <button type="button" className="btn btn-outline" onClick={() => submit("draft")} disabled={Boolean(busy)}>{busy === "draft" ? "Saving…" : "Save draft"}</button>
        )}
        <button type="submit" className="btn btn-primary" disabled={Boolean(busy) || (isPublished && !dirty)}>{busy === "publish" ? "Saving…" : publishLabel}</button>
      </div>
    </form>
  );
}
