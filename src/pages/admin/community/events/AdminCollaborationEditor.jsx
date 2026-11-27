import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Info, Plus, Trash2 } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import {
  getAdminCollaboration,
  saveAdminCollaboration,
  setAdminCollaborationStatus,
  validateCollaboration,
} from "../../../../features/community/admin/events/adminEventsService";
import {
  EditorCard,
  ErrorSummary,
  Field,
  RadioPill,
  RestoreDraftNotice,
  SampleNotice,
  SkillsInput,
  Tag,
} from "../../../../features/community/admin/events/EventControls";
import {
  clearLocalDraft,
  COLLAB_FORMATS,
  COLLAB_STATUS,
  focusFirstError,
  LEVELS,
  readLocalDraft,
  timeWat,
  useLocalDraft,
} from "../../../../features/community/admin/events/eventHelpers";
import { useCommunityList } from "../../../../features/community/listHooks";

// A06 Create / edit collaboration project.
const FIELD_ORDER = ["title", "category", "level", "description", "minMembers", "maxMembers", "roles", "submissionRequirements", "formats", "formUntil", "deadline", "pointsPerMember"];
const LIST_PATH = "/admin/community/collaborations";

export default function AdminCollaborationEditor() {
  const { id } = useParams();
  const { data, error, loading, reload } = useCommunityList(getAdminCollaboration, { id: id ?? "" });

  if (loading) return <section className="admin-page"><Loader label="Loading collaboration…" /></section>;
  if (error) {
    return (
      <section className="admin-page community-admin">
        <Link to={LIST_PATH} className="community-back-link"><ArrowLeft size={16} aria-hidden="true" /> Back to collaborations</Link>
        <ErrorMessage message={error} onRetry={reload} />
      </section>
    );
  }
  return (
    <CollaborationForm
      key={data.collaboration.id ?? "new"}
      initial={data.collaboration}
      categories={data.categories ?? []}
      range={data.teamSizeRange}
      sample={data.isSample}
    />
  );
}

function CollaborationForm({ initial, categories, range, sample }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = !initial.id;
  const draftKey = `cae:collaboration:${initial.id ?? "new"}`;
  const [item, setItem] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState(() => location.state?.toast ?? null);
  const [restore, setRestore] = useState(() => {
    const stored = readLocalDraft(draftKey);
    return stored && JSON.stringify(stored.value) !== JSON.stringify(initial) ? stored : null;
  });
  const closeToast = useCallback(() => setToast(null), []);
  const summaryRef = useRef(null);

  const dirty = JSON.stringify(item) !== saved;
  const autosavedAt = useLocalDraft(draftKey, item, dirty && !restore);
  const status = COLLAB_STATUS[item.status] ?? COLLAB_STATUS.draft;
  const savedTitle = JSON.parse(saved).title;

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (field) => (value) => {
    setItem((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  async function save(nextStatus) {
    const publishing = nextStatus === "published";
    const found = validateCollaboration(item, { publishing, range });
    if (Object.values(found).some(Boolean)) {
      setErrors(found);
      focusFirstError(FIELD_ORDER, found, summaryRef.current);
      return;
    }
    setErrors({});
    setBusy(publishing && item.status !== "published" ? "publish" : "save");
    try {
      const payload = {
        ...item,
        status: nextStatus,
        minMembers: Number(item.minMembers),
        maxMembers: Number(item.maxMembers),
        pointsPerMember: item.pointsPerMember === "" ? 0 : Number(item.pointsPerMember),
        roles: item.roles.filter((role) => role.name.trim() || role.responsibility.trim()),
      };
      const result = await saveAdminCollaboration(payload, { sample });
      const savedItem = result?.collaboration ?? result;
      clearLocalDraft(draftKey);
      const message = publishing && item.status !== "published"
        ? `“${savedItem.title}” is published in the Collaboration library.`
        : isNew ? "Draft saved." : "Changes saved.";
      if (isNew) {
        setSaved(JSON.stringify(item));
        navigate(`${LIST_PATH}/${encodeURIComponent(savedItem.id)}/edit`, { replace: true, state: { toast: { type: "success", message } } });
        return;
      }
      setItem(savedItem);
      setSaved(JSON.stringify(savedItem));
      setToast({ type: "success", message });
    } catch (saveError) {
      setToast({ type: "error", message: saveError.message || "The collaboration could not be saved. Please try again." });
    } finally {
      setBusy("");
    }
  }

  async function close() {
    setBusy("status");
    try {
      await setAdminCollaborationStatus(item.id, "closed", { sample });
      setItem((current) => ({ ...current, status: "closed" }));
      setSaved((current) => JSON.stringify({ ...JSON.parse(current), status: "closed" }));
      setToast({ type: "success", message: "Closed. No new teams can form; existing teams keep working." });
    } catch (statusError) {
      setToast({ type: "error", message: statusError.message || "The status could not be changed." });
    } finally {
      setBusy("");
    }
  }

  const autosaveLabel = autosavedAt && dirty
    ? `${item.status === "draft" ? "Draft" : "Unsaved"} · autosaved ${timeWat.format(new Date(autosavedAt))}`
    : isNew ? "New draft" : dirty ? "Unsaved changes" : item.status === "draft" ? "Draft · saved" : null;

  return (
    <section className="admin-page community-admin community-editor">
      <Link to={LIST_PATH} className="community-back-link"><ArrowLeft size={16} aria-hidden="true" /> Back to collaborations</Link>

      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COLLABORATION EDITOR</span>
          <h1>{isNew ? "New collaboration project" : savedTitle || "Untitled collaboration"}</h1>
          <p>Students form teams of {item.minMembers || range.min}–{item.maxMembers || range.max} to build this project together and submit one final piece of work.</p>
        </div>
        <div className="cae-header-tags">
          {!isNew && <Tag tone={status.tone}>{status.label}</Tag>}
          {autosaveLabel && (
            <span className="community-tag tag-amber" title={autosavedAt ? "Autosaved in this browser. Save the draft to keep it on the server." : undefined}>
              {autosaveLabel}
            </span>
          )}
        </div>
      </header>

      {sample && <SampleNotice editing />}
      {restore && (
        <RestoreDraftNotice
          savedAt={timeWat.format(new Date(restore.savedAt))}
          onRestore={() => { setItem({ ...restore.value, id: initial.id, status: initial.status }); setRestore(null); }}
          onDiscard={() => { clearLocalDraft(draftKey); setRestore(null); }}
        />
      )}
      <ErrorSummary order={FIELD_ORDER} errors={errors} summaryRef={summaryRef} />

      <form className="community-editor-layout" onSubmit={(event) => { event.preventDefault(); save(item.status === "published" ? "published" : "draft"); }} noValidate>
        <div className="community-editor-main">
          <EditorCard title="Project basics">
            <Field id="field-title" label="Project title" error={errors.title}>
              {(props) => <input {...props} className="ui-input" value={item.title} maxLength={140} onChange={(event) => set("title")(event.target.value)} />}
            </Field>
            <div className="community-field-grid">
              <Field id="field-category" label="Category" error={errors.category} hint="Categories are managed in Community settings.">
                {(props) => (
                  <select {...props} className="ui-input" value={item.category} onChange={(event) => set("category")(event.target.value)}>
                    <option value="">Choose a category</option>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                )}
              </Field>
              <Field id="field-level" label="Difficulty" error={errors.level}>
                {(props) => (
                  <select {...props} className="ui-input" value={item.level} onChange={(event) => set("level")(event.target.value)}>
                    <option value="">Choose a difficulty</option>
                    {LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
                  </select>
                )}
              </Field>
            </div>
            <div className="community-field">
              <RadioPill
                name="collab-access"
                legend="Access"
                value={item.access}
                onChange={set("access")}
                describedBy="collab-access-hint"
                options={[{ value: "free", label: "Free" }, { value: "premium", label: "Premium" }]}
              />
              <p id="collab-access-hint" className="cae-hint">
                {item.access === "premium"
                  ? "Premium collaborations are visible to everyone but only Premium and Premium Plus members can join."
                  : "Free collaborations are open to every registered student."}
              </p>
            </div>
            <Field id="field-description" label="Project description" error={errors.description}>
              {(props) => <textarea {...props} className="ui-input" rows={4} value={item.description} onChange={(event) => set("description")(event.target.value)} />}
            </Field>
          </EditorCard>

          <EditorCard title="Team setup" aside={<span className="community-tag tag-blue">Allowed range: {range.min}–{range.max} members</span>}>
            <div className="community-field-grid">
              <Field id="field-minMembers" label="Minimum members" error={errors.minMembers}>
                {(props) => <input {...props} type="number" inputMode="numeric" min={range.min} max={range.max} className="ui-input" value={item.minMembers} onChange={(event) => set("minMembers")(event.target.value === "" ? "" : Number(event.target.value))} />}
              </Field>
              <Field id="field-maxMembers" label="Maximum members" error={errors.maxMembers}>
                {(props) => <input {...props} type="number" inputMode="numeric" min={range.min} max={range.max} className="ui-input" value={item.maxMembers} onChange={(event) => set("maxMembers")(event.target.value === "" ? "" : Number(event.target.value))} />}
              </Field>
            </div>
            <p className="cae-info"><Info size={16} aria-hidden="true" /> A team becomes Active when it reaches {item.minMembers || "the minimum"} members. Join requests are blocked once a team has {item.maxMembers || "the maximum"}.</p>
            <fieldset className="community-fieldset">
              <legend>Who can start a team</legend>
              <label className="community-checkbox"><input type="checkbox" checked={item.anyoneCanStart} onChange={(event) => set("anyoneCanStart")(event.target.checked)} /> Any eligible student can create a new team</label>
              <label className="community-checkbox"><input type="checkbox" checked={item.leadersApprove} onChange={(event) => set("leadersApprove")(event.target.checked)} /> Team leaders accept or reject join requests</label>
            </fieldset>
            <SkillsInput id="field-skills" label="Required skills" skills={item.skills} onChange={set("skills")} />
          </EditorCard>

          <RolesCard roles={item.roles} onChange={set("roles")} error={errors.roles} />

          <EditorCard title="Submission">
            <Field id="field-submissionRequirements" label="Submission requirements" error={errors.submissionRequirements}>
              {(props) => <textarea {...props} className="ui-input" rows={4} value={item.submissionRequirements} onChange={(event) => set("submissionRequirements")(event.target.value)} />}
            </Field>
            <fieldset id="field-formats" tabIndex={-1} className="community-fieldset">
              <legend>Accepted formats</legend>
              <div className="cae-check-row">
                {COLLAB_FORMATS.map((format) => (
                  <label key={format.value} className="community-checkbox">
                    <input
                      type="checkbox"
                      checked={item.formats.includes(format.value)}
                      onChange={() => set("formats")(item.formats.includes(format.value) ? item.formats.filter((value) => value !== format.value) : [...item.formats, format.value])}
                    />
                    {format.label}
                  </label>
                ))}
              </div>
              {errors.formats && <p className="field-error">{errors.formats}</p>}
            </fieldset>
          </EditorCard>
        </div>

        <aside className="community-editor-side">
          <EditorCard title="Schedule">
            <Field id="field-formUntil" label="Teams can form until" error={errors.formUntil}>
              {(props) => <input {...props} type="date" className="ui-input" value={item.formUntil} onChange={(event) => set("formUntil")(event.target.value)} />}
            </Field>
            <Field id="field-deadline" label="Submission deadline" error={errors.deadline} hint="Ends at 23:59 West Africa Time.">
              {(props) => <input {...props} type="date" className="ui-input" min={item.formUntil || undefined} value={item.deadline} onChange={(event) => set("deadline")(event.target.value)} />}
            </Field>
            <Field id="field-pointsPerMember" label="Points per member on approval" error={errors.pointsPerMember}>
              {(props) => <input {...props} type="number" inputMode="numeric" min={0} max={1000} step={10} className="ui-input" value={item.pointsPerMember} onChange={(event) => set("pointsPerMember")(event.target.value === "" ? "" : Number(event.target.value))} />}
            </Field>
          </EditorCard>

          <EditorCard title={item.status === "published" ? "Published" : "Publish"}>
            <p className="cae-side-text">
              {item.status === "published"
                ? "This project is live in the Collaboration library. Changes apply to teams that form from now on."
                : `Publishing makes the project visible in the Collaboration library${item.access === "premium" && item.category ? ` and notifies Premium members in ${item.category}` : ""}.`}
            </p>
            <div className="cae-side-actions">
              {item.status === "published" ? (
                <>
                  <button type="submit" className="btn btn-primary" disabled={Boolean(busy) || !dirty}>{busy === "save" ? "Saving…" : "Save changes"}</button>
                  <button type="button" className="btn btn-outline" onClick={close} disabled={Boolean(busy)}>{busy === "status" ? "Closing…" : "Close to new teams"}</button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-primary" onClick={() => save("published")} disabled={Boolean(busy)}>{busy === "publish" ? "Publishing…" : item.status === "closed" ? "Reopen and publish" : "Publish collaboration"}</button>
                  <button type="submit" className="btn btn-outline" disabled={Boolean(busy)}>{busy === "save" ? "Saving…" : "Save draft"}</button>
                </>
              )}
              <Link to={LIST_PATH} className="btn btn-ghost">Cancel</Link>
            </div>
          </EditorCard>
        </aside>
      </form>
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

function RolesCard({ roles, onChange, error }) {
  const list = roles.length ? roles : [{ name: "", responsibility: "" }];
  const update = (index, changes) => onChange(list.map((role, i) => (i === index ? { ...role, ...changes } : role)));
  return (
    <EditorCard
      title="Team roles and responsibilities"
      aside={<button type="button" className="btn btn-outline btn-sm" onClick={() => onChange([...list, { name: "", responsibility: "" }])}><Plus size={15} aria-hidden="true" /> Add role</button>}
    >
      <p className="cae-hint">Suggested roles. Teams can rename or reassign them in their workspace.</p>
      <div id="field-roles" tabIndex={-1} className="cae-roles">
        <div className="cae-roles-head" aria-hidden="true"><span>Role</span><span>Responsibility</span></div>
        {list.map((role, index) => (
          <div key={index} className="cae-role-row">
            <input className="ui-input" aria-label={`Role ${index + 1} name`} placeholder="Role" value={role.name} onChange={(event) => update(index, { name: event.target.value })} />
            <input className="ui-input" aria-label={`Role ${index + 1} responsibility`} placeholder="What this person owns" value={role.responsibility} onChange={(event) => update(index, { responsibility: event.target.value })} />
            <button type="button" className="community-icon-button" aria-label={`Remove role ${index + 1}`} disabled={list.length === 1} onClick={() => onChange(list.filter((_, i) => i !== index))}>
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      {error && <p className="field-error">{error}</p>}
    </EditorCard>
  );
}
