import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import {
  addCategory, getCommunitySettings, renameCategory, saveCommunitySettings, setCategoryArchived,
} from "../../../../features/community/admin/manage/adminManageService";
import { ConfirmDialog, Field, SampleNotice, StatusTabs, Switch } from "../../../../features/community/admin/manage/manageControls";
import { shortDate, useToastState } from "../../../../features/community/admin/manage/manageUtils";
import { useCommunityList } from "../../../../features/community/listHooks";

const NO_FILTERS = {};
const FILE_SIZES = [5, 10, 25, 50, 100];
const RESUBMISSIONS = [
  { value: "0", label: "Not allowed" },
  { value: "1", label: "1 per project" },
  { value: "2", label: "2 per project" },
  { value: "3", label: "3 per project" },
  { value: "unlimited", label: "Unlimited" },
];
const AUTO_HIDE = [
  { value: "off", label: "Never (review first)" },
  { value: "2", label: "2 reports" },
  { value: "3", label: "3 reports" },
  { value: "5", label: "5 reports" },
];
const GROUP_NOUN = { projects: "Projects", competitions: "Competitions", hackathons: "Hackathons" };

export default function AdminCommunitySettings() {
  const { data, error, loading, reload } = useCommunityList(getCommunitySettings, NO_FILTERS);
  const [toast, setToast, closeToast] = useToastState();
  return (
    <>
      {loading && <section className="admin-page"><Loader label="Loading settings…" /></section>}
      {error && <section className="admin-page community-admin cam-page"><ErrorMessage message={error} onRetry={reload} /></section>}
      {data && <SettingsForm key={JSON.stringify(data.settings)} data={data} onToast={setToast} reload={reload} />}
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </>
  );
}

function validate(settings) {
  const errors = {};
  if (!settings.rules.trim()) errors.rules = "Write the community rules students must accept.";
  const files = Number(settings.filesPerSubmission);
  if (!Number.isInteger(files) || files < 1 || files > 20) errors.filesPerSubmission = "Enter 1 to 20 files.";
  if (!settings.formats.some((format) => format.enabled)) errors.formats = "Allow at least one submission format.";
  return errors;
}

function SettingsForm({ data, onToast, reload }) {
  const [settings, setSettings] = useState(data.settings);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const dirty = JSON.stringify(settings) !== JSON.stringify(data.settings);
  const sample = Boolean(data.isSample);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const setModeration = (field, value) => set("moderation", { ...settings.moderation, [field]: value });
  const setNotification = (key, channel, value) => set("notifications", settings.notifications.map((item) => (item.key === key ? { ...item, [channel]: value } : item)));
  const toggleFormat = (key) => set("formats", settings.formats.map((item) => (item.key === key ? { ...item, enabled: !item.enabled } : item)));

  async function save() {
    const found = validate(settings);
    setErrors(found);
    const first = ["rules", "filesPerSubmission", "formats"].find((field) => found[field]);
    if (first) { document.getElementById(`settings-${first}`)?.focus(); return; }
    setBusy(true);
    try {
      await saveCommunitySettings({ ...settings, filesPerSubmission: Number(settings.filesPerSubmission) }, { sample });
      onToast({ type: "success", message: "Community settings saved." });
      reload();
    } catch (saveError) {
      onToast({ type: "error", message: saveError.message || "The settings could not be saved." });
    } finally {
      setBusy(false);
    }
  }

  const errorList = ["rules", "filesPerSubmission", "formats"].filter((field) => errors[field]);

  return (
    <section className="admin-page community-admin cam-page">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">CONFIGURATION</span>
          <h1>Community settings</h1>
          <p>Rules, file limits, categories, notifications and moderation for the whole Community module.</p>
        </div>
        <div className="community-editor-actions">
          <button type="button" className="btn btn-outline" onClick={() => setConfirmDiscard(true)} disabled={!dirty || busy}>Discard</button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={!dirty || busy}>{busy ? "Saving…" : "Save changes"}</button>
        </div>
      </header>

      {sample && <SampleNotice />}
      {dirty && <p className="cam-dirty-note" role="status">You have unsaved changes.</p>}
      {errorList.length > 0 && (
        <div className="community-error-summary" role="alert">
          <strong>Fix {errorList.length === 1 ? "this" : `these ${errorList.length} things`} first:</strong>
          <ul>{errorList.map((field) => <li key={field}><a href={`#settings-${field}`}>{errors[field]}</a></li>)}</ul>
        </div>
      )}

      <div className="cam-split cam-split-wide">
        <div className="cam-split-main cam-stack">
          <section className="ui-card cam-editor" aria-labelledby="rules-title">
            <h2 id="rules-title">Community rules</h2>
            <Field id="settings-rules" label="Shown to every student before their first post or submission." error={errors.rules}>
              {(props) => <textarea {...props} className="ui-input" rows={7} value={settings.rules} onChange={(event) => set("rules", event.target.value)} />}
            </Field>
            {settings.rulesUpdatedAt && <p className="cam-muted-small">Last updated {shortDate.format(new Date(settings.rulesUpdatedAt))}{settings.rulesUpdatedBy ? ` by ${settings.rulesUpdatedBy}` : ""}</p>}
          </section>

          <section className="ui-card cam-editor" aria-labelledby="submissions-title">
            <h2 id="submissions-title">Submissions</h2>
            <div className="cam-grid-3">
              <Field id="settings-maxFileSizeMb" label="Maximum file size">
                {(props) => (
                  <select {...props} className="ui-input" value={settings.maxFileSizeMb} onChange={(event) => set("maxFileSizeMb", Number(event.target.value))}>
                    {FILE_SIZES.map((size) => <option key={size} value={size}>{size} MB</option>)}
                  </select>
                )}
              </Field>
              <Field id="settings-filesPerSubmission" label="Files per submission" error={errors.filesPerSubmission}>
                {(props) => <input {...props} className="ui-input" type="number" inputMode="numeric" min="1" max="20" value={settings.filesPerSubmission} onChange={(event) => set("filesPerSubmission", event.target.value)} />}
              </Field>
              <Field id="settings-resubmissions" label="Resubmissions allowed">
                {(props) => (
                  <select {...props} className="ui-input" value={settings.resubmissions} onChange={(event) => set("resubmissions", event.target.value)}>
                    {RESUBMISSIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                )}
              </Field>
            </div>
            <fieldset className="community-fieldset" id="settings-formats" tabIndex={-1} aria-describedby="formats-hint">
              <legend>Allowed formats</legend>
              <p id="formats-hint" className="cam-muted-small">Select a format to turn it on or off.</p>
              <div className="cam-format-chips">
                {settings.formats.map((format) => (
                  <button key={format.key} type="button" className={`cam-format${format.enabled ? " is-on" : ""}`} aria-pressed={format.enabled} onClick={() => toggleFormat(format.key)}>
                    {format.label}{!format.enabled && " (off)"}
                  </button>
                ))}
              </div>
              {errors.formats && <p className="field-error">{errors.formats}</p>}
              <AddFormat formats={settings.formats} onAdd={(format) => set("formats", [...settings.formats, format])} />
            </fieldset>
          </section>

          <Categories categories={data.categories} sample={sample} onToast={onToast} reload={reload} />
        </div>

        <aside className="cam-split-side cam-stack">
          <section className="ui-card" aria-labelledby="notifications-title">
            <h2 id="notifications-title">Notifications</h2>
            <table className="cam-notify-table">
              <thead>
                <tr><th scope="col"><span className="sr-only">Event</span></th><th scope="col">In-app</th><th scope="col">Email</th></tr>
              </thead>
              <tbody>
                {settings.notifications.map((item) => (
                  <tr key={item.key}>
                    <th scope="row">{item.label}</th>
                    <td><Switch checked={item.inApp} label={`${item.label}: in-app`} onChange={(value) => setNotification(item.key, "inApp", value)} /></td>
                    <td><Switch checked={item.email} label={`${item.label}: email`} onChange={(value) => setNotification(item.key, "email", value)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="ui-card cam-editor" aria-labelledby="moderation-title">
            <h2 id="moderation-title">Moderation</h2>
            <Field id="settings-autohide" label="Auto-hide content after" hint="Hidden content stays in the moderation queue until an admin decides.">
              {(props) => (
                <select {...props} className="ui-input" value={settings.moderation.autoHideAfter} onChange={(event) => setModeration("autoHideAfter", event.target.value)}>
                  {AUTO_HIDE.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              )}
            </Field>
            <Field id="settings-blocked" label="Blocked words" hint="Separate with commas. Posts containing them go to review.">
              {(props) => <textarea {...props} className="ui-input" rows={2} value={settings.moderation.blockedWords} onChange={(event) => setModeration("blockedWords", event.target.value)} />}
            </Field>
            <label className="community-checkbox"><input type="checkbox" checked={settings.moderation.reviewShowcase} onChange={(event) => setModeration("reviewShowcase", event.target.checked)} /> Review showcase posts before they go public</label>
            <label className="community-checkbox"><input type="checkbox" checked={settings.moderation.allowComments} onChange={(event) => setModeration("allowComments", event.target.checked)} /> Allow comments on showcase projects</label>
            <label className="community-checkbox"><input type="checkbox" checked={settings.moderation.allowNewMemberComments} disabled={!settings.moderation.allowComments} onChange={(event) => setModeration("allowNewMemberComments", event.target.checked)} /> Allow comments from members under 7 days old</label>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard your changes?"
        confirmLabel="Discard changes"
        danger
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => { setSettings(data.settings); setErrors({}); setConfirmDiscard(false); }}
      >
        <p>All settings go back to the last saved values. Category changes are saved straight away and are not affected.</p>
      </ConfirmDialog>
    </section>
  );
}

function AddFormat({ formats, onAdd }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  function add() {
    const label = text.trim();
    if (!label) { setError("Enter a format name, for example MP4."); return; }
    if (formats.some((item) => item.label.toLowerCase() === label.toLowerCase())) { setError(`${label} is already in the list.`); return; }
    onAdd({ key: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label, enabled: true });
    setText("");
    setError("");
    setOpen(false);
  }

  if (!open) return <button type="button" className="btn btn-outline btn-sm community-add-button" onClick={() => setOpen(true)}><Plus size={15} aria-hidden="true" /> Add format</button>;
  return (
    <div className="cam-inline-add">
      <label htmlFor="new-format" className="sr-only">New format</label>
      <input
        id="new-format"
        className="ui-input"
        placeholder="e.g. MP4"
        value={text}
        maxLength={30}
        autoFocus
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "new-format-error" : undefined}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } if (event.key === "Escape") setOpen(false); }}
      />
      <button type="button" className="btn btn-outline btn-sm" onClick={add}>Add</button>
      <button type="button" className="community-icon-button" aria-label="Cancel adding a format" onClick={() => { setOpen(false); setError(""); }}><X size={15} aria-hidden="true" /></button>
      {error && <p id="new-format-error" className="field-error">{error}</p>}
    </div>
  );
}

function Categories({ categories, sample, onToast, reload }) {
  const [group, setGroup] = useState("projects");
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState("");
  const [renaming, setRenaming] = useState(null); // { id, name, error }
  const [busy, setBusy] = useState("");
  const rows = categories.filter((item) => item.group === group);
  const countLabel = GROUP_NOUN[group];

  async function run(id, work, message) {
    setBusy(id);
    try {
      await work();
      onToast({ type: "success", message });
      reload();
      return true;
    } catch (runError) {
      onToast({ type: "error", message: runError.message || "That didn't work. Please try again." });
      return false;
    } finally {
      setBusy("");
    }
  }

  async function add(event) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) { setAddError("Enter a category name."); return; }
    if (categories.some((item) => item.group === group && item.name.toLowerCase() === name.toLowerCase())) { setAddError(`“${name}” already exists.`); return; }
    setAddError("");
    if (await run("add", () => addCategory(group, name, { sample }), `“${name}” added to ${countLabel.toLowerCase()} categories.`)) setNewName("");
  }

  async function saveRename() {
    const name = renaming.name.trim();
    if (!name) { setRenaming({ ...renaming, error: "Enter a name." }); return; }
    if (await run(renaming.id, () => renameCategory(renaming.id, name, { sample }), `Renamed to “${name}”.`)) setRenaming(null);
  }

  return (
    <section className="ui-card community-admin-table-card" aria-labelledby="categories-title">
      <div className="ui-card-header">
        <h2 id="categories-title">Categories</h2>
        <StatusTabs label="Category type" value={group} onChange={(value) => { setGroup(value); setRenaming(null); }} tabs={Object.entries(GROUP_NOUN).map(([value, label]) => ({ value, label }))} />
      </div>
      <p className="cam-muted-small cam-pad-x">Category changes are saved straight away. Archived categories are hidden from students; existing items keep them.</p>
      <div className="community-table-wrap" tabIndex={0} role="region" aria-label={`${countLabel} categories (scrolls sideways)`}>
        <table className="community-table">
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col" className="is-number">{countLabel}</th>
              <th scope="col">Status</th>
              <th scope="col"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">
                  {renaming?.id === row.id ? (
                    <span className="cam-inline-add">
                      <label htmlFor={`rename-${row.id}`} className="sr-only">New name for {row.name}</label>
                      <input
                        id={`rename-${row.id}`}
                        className="ui-input"
                        value={renaming.name}
                        autoFocus
                        aria-invalid={Boolean(renaming.error)}
                        onChange={(event) => setRenaming({ ...renaming, name: event.target.value, error: "" })}
                        onKeyDown={(event) => { if (event.key === "Enter") saveRename(); if (event.key === "Escape") setRenaming(null); }}
                      />
                      {renaming.error && <span className="field-error">{renaming.error}</span>}
                    </span>
                  ) : <strong>{row.name}</strong>}
                </th>
                <td className="is-number">{row.count}</td>
                <td><span className={`community-tag ${row.status === "active" ? "tag-green" : "tag-neutral"}`}>{row.status === "active" ? "Active" : "Archived"}</span></td>
                <td>
                  <div className="cam-row-actions">
                    {renaming?.id === row.id ? (
                      <>
                        <button type="button" className="btn btn-primary btn-sm" onClick={saveRename} disabled={busy === row.id}>{busy === row.id ? "Saving…" : "Save"}</button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setRenaming(null)}>Cancel</button>
                      </>
                    ) : row.status === "active" ? (
                      <>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setRenaming({ id: row.id, name: row.name, error: "" })} aria-label={`Rename ${row.name}`}>Rename</button>
                        <button type="button" className="btn btn-outline btn-sm" disabled={busy === row.id} onClick={() => run(row.id, () => setCategoryArchived(row.id, true, { sample }), `“${row.name}” archived.`)} aria-label={`Archive ${row.name}`}>Archive</button>
                      </>
                    ) : (
                      <button type="button" className="btn btn-outline btn-sm" disabled={busy === row.id} onClick={() => run(row.id, () => setCategoryArchived(row.id, false, { sample }), `“${row.name}” restored.`)} aria-label={`Restore ${row.name}`}>Restore</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form className="cam-add-category" onSubmit={add} noValidate>
        <label htmlFor="new-category" className="sr-only">New {countLabel.toLowerCase()} category name</label>
        <input id="new-category" className="ui-input" placeholder="New category name, e.g. Cloud Computing" value={newName} maxLength={60} aria-invalid={Boolean(addError)} aria-describedby={addError ? "new-category-error" : undefined} onChange={(event) => { setNewName(event.target.value); setAddError(""); }} />
        <button type="submit" className="btn btn-primary" disabled={busy === "add"}>{busy === "add" ? "Adding…" : "Add category"}</button>
        {addError && <p id="new-category-error" className="field-error">{addError}</p>}
      </form>
    </section>
  );
}
