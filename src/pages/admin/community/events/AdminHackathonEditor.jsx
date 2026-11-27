import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Plus, Trash2, Upload, X } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import Modal from "../../../../components/common/Modal";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import {
  deleteAdminHackathon,
  getAdminHackathon,
  saveAdminHackathon,
  uploadEventImage,
  validateHackathon,
} from "../../../../features/community/admin/events/adminEventsService";
import { EditorCard, ErrorSummary, Field, RadioPill, RestoreDraftNotice, SampleNotice, Tag } from "../../../../features/community/admin/events/EventControls";
import {
  clearLocalDraft,
  criteriaTotal,
  DAY,
  focusFirstError,
  fromWatInput,
  HOUR,
  readLocalDraft,
  timeWat,
  toWatInput,
  useLocalDraft,
} from "../../../../features/community/admin/events/eventHelpers";
import { useCommunityList } from "../../../../features/community/listHooks";

// A09 Create / edit hackathon. All times are entered and shown in West Africa Time.
const FIELD_ORDER = ["title", "category", "description", "rules", "startsAt", "endsAt", "registrationClosesAt", "minTeam", "maxTeam", "participantLimit", "criteria", "submissionInstructions", "prizes", "judges"];
const LIST_PATH = "/admin/community/hackathons";
const STATUS = {
  draft: { label: "Draft", tone: "amber" },
  scheduled: { label: "Scheduled", tone: "blue" },
  live: { label: "Live", tone: "red" },
  ended: { label: "Ended", tone: "neutral" },
};
const MB = 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export default function AdminHackathonEditor() {
  const { id } = useParams();
  const { data, error, loading, reload } = useCommunityList(getAdminHackathon, { id: id ?? "" });

  if (loading) return <section className="admin-page"><Loader label="Loading hackathon…" /></section>;
  if (error) {
    return (
      <section className="admin-page community-admin">
        <Link to={LIST_PATH} className="community-back-link"><ArrowLeft size={16} aria-hidden="true" /> Back to hackathons</Link>
        <ErrorMessage message={error} onRetry={reload} />
      </section>
    );
  }
  return <HackathonForm key={data.hackathon.id ?? "new"} initial={data.hackathon} categories={data.categories ?? []} judgePool={data.judges ?? []} sample={data.isSample} />;
}

function HackathonForm({ initial, categories, judgePool, sample }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = !initial.id;
  const draftKey = `cae:hackathon:${initial.id ?? "new"}`;
  const [item, setItem] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [endsTouched, setEndsTouched] = useState(!isNew);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toast, setToast] = useState(() => location.state?.toast ?? null);
  const [restore, setRestore] = useState(() => {
    const stored = readLocalDraft(draftKey);
    return stored && JSON.stringify(stored.value) !== JSON.stringify(initial) ? stored : null;
  });
  const closeToast = useCallback(() => setToast(null), []);
  const summaryRef = useRef(null);

  const dirty = JSON.stringify(item) !== saved;
  const autosavedAt = useLocalDraft(draftKey, item, dirty && !restore);
  const status = STATUS[item.status] ?? STATUS.draft;
  const isDraft = item.status === "draft";
  const started = item.status === "live" || item.status === "ended";

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

  function setStart(value) {
    const startsAt = fromWatInput(value);
    setItem((current) => ({
      ...current,
      startsAt,
      // The end follows the start (24 hours later) until the admin changes it.
      endsAt: !endsTouched && startsAt ? new Date(new Date(startsAt).getTime() + DAY).toISOString() : current.endsAt,
    }));
    if (errors.startsAt || errors.endsAt) setErrors((current) => ({ ...current, startsAt: undefined, endsAt: undefined }));
  }

  async function save(nextStatus) {
    const publishing = nextStatus !== "draft";
    const found = validateHackathon(item, { publishing });
    if (Object.values(found).some(Boolean)) {
      setErrors(found);
      focusFirstError(FIELD_ORDER, found, summaryRef.current);
      return;
    }
    setErrors({});
    setBusy(publishing && isDraft ? "schedule" : "save");
    try {
      const payload = {
        ...item,
        status: nextStatus,
        minTeam: Number(item.minTeam),
        maxTeam: Number(item.maxTeam),
        participantLimit: item.participantLimit === "" ? null : Number(item.participantLimit),
        criteria: item.criteria.filter((criterion) => criterion.name.trim() || criterion.weight !== "").map((criterion) => ({ ...criterion, weight: Number(criterion.weight) || 0 })),
      };
      const result = await saveAdminHackathon(payload, { sample });
      const savedItem = result?.hackathon ?? result;
      clearLocalDraft(draftKey);
      const message = publishing && isDraft
        ? `“${savedItem.title}” is scheduled. Registration is open and the community has been told.`
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
      setToast({ type: "error", message: saveError.message || "The hackathon could not be saved. Please try again." });
    } finally {
      setBusy("");
    }
  }

  async function remove() {
    setBusy("delete");
    try {
      await deleteAdminHackathon(item.id, { sample });
      clearLocalDraft(draftKey);
      setSaved(JSON.stringify(item));
      navigate(LIST_PATH, { replace: true });
    } catch (deleteError) {
      setToast({ type: "error", message: deleteError.message || "The draft could not be deleted." });
      setBusy("");
      setDeleteOpen(false);
    }
  }

  const durationHours = item.startsAt && item.endsAt ? Math.round((new Date(item.endsAt) - new Date(item.startsAt)) / HOUR) : null;
  const autosaveLabel = autosavedAt && dirty
    ? `${isDraft ? "Draft" : "Unsaved"} · autosaved ${timeWat.format(new Date(autosavedAt))}`
    : isNew ? "New draft" : dirty ? "Unsaved changes" : null;

  return (
    <section className="admin-page community-admin community-editor">
      <Link to={LIST_PATH} className="community-back-link"><ArrowLeft size={16} aria-hidden="true" /> Back to hackathons</Link>

      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">HACKATHON EDITOR</span>
          <h1>{isNew ? "New hackathon" : JSON.parse(saved).title || "Untitled hackathon"}</h1>
          <p>Set the challenge, timing and prizes. Students see it as soon as you schedule it.</p>
        </div>
        <div className="cae-header-tags">
          {!isNew && <Tag tone={status.tone}>{status.label}</Tag>}
          {autosaveLabel && <span className="community-tag tag-amber" title={autosavedAt ? "Autosaved in this browser. Save the draft to keep it on the server." : undefined}>{autosaveLabel}</span>}
        </div>
      </header>

      {sample && <SampleNotice editing />}
      {started && <p className="cae-info">This hackathon has started. Timing and team rules are locked; you can still fix wording, prizes and judges.</p>}
      {restore && (
        <RestoreDraftNotice
          savedAt={timeWat.format(new Date(restore.savedAt))}
          onRestore={() => { setItem({ ...restore.value, id: initial.id, status: initial.status }); setRestore(null); }}
          onDiscard={() => { clearLocalDraft(draftKey); setRestore(null); }}
        />
      )}
      <ErrorSummary order={FIELD_ORDER} errors={errors} summaryRef={summaryRef} />

      <form className="community-editor-layout" onSubmit={(event) => { event.preventDefault(); save(isDraft ? "draft" : "scheduled"); }} noValidate>
        <div className="community-editor-main">
          <EditorCard title="Challenge">
            <BannerField url={item.bannerUrl} onChange={set("bannerUrl")} sample={sample} onError={setToast} />
            <Field id="field-title" label="Hackathon title" error={errors.title}>
              {(props) => <input {...props} className="ui-input" value={item.title} maxLength={140} onChange={(event) => set("title")(event.target.value)} />}
            </Field>
            <div className="community-field-grid">
              <Field id="field-category" label="Category" error={errors.category}>
                {(props) => (
                  <select {...props} className="ui-input" value={item.category} onChange={(event) => set("category")(event.target.value)}>
                    <option value="">Choose a category</option>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                )}
              </Field>
              <RadioPill name="hackathon-access" legend="Access" value={item.access} onChange={set("access")} options={[{ value: "free", label: "Free" }, { value: "premium", label: "Premium" }]} />
            </div>
            <Field id="field-description" label="Challenge description" error={errors.description}>
              {(props) => <textarea {...props} className="ui-input" rows={4} value={item.description} onChange={(event) => set("description")(event.target.value)} />}
            </Field>
            <Field id="field-rules" label="Rules" error={errors.rules}>
              {(props) => <textarea {...props} className="ui-input" rows={5} value={item.rules} onChange={(event) => set("rules")(event.target.value)} />}
            </Field>
          </EditorCard>

          <EditorCard title="Timing" aside={durationHours !== null && durationHours > 0 ? <span className="community-tag tag-blue">Duration: {durationHours} {durationHours === 1 ? "hour" : "hours"}</span> : null}>
            <div className="community-field-grid">
              <Field id="field-startsAt" label="Starts (WAT)" error={errors.startsAt}>
                {(props) => <input {...props} type="datetime-local" className="ui-input" disabled={started} value={toWatInput(item.startsAt)} onChange={(event) => setStart(event.target.value)} />}
              </Field>
              <Field id="field-endsAt" label="Ends (WAT)" error={errors.endsAt} hint="Set automatically to 24 hours after the start. You can override it.">
                {(props) => <input {...props} type="datetime-local" className="ui-input" disabled={item.status === "ended"} value={toWatInput(item.endsAt)} onChange={(event) => { setEndsTouched(true); set("endsAt")(fromWatInput(event.target.value)); }} />}
              </Field>
              <Field id="field-timezone" label="Time zone" hint="All CodeRise events run on West Africa Time.">
                {(props) => (
                  <select {...props} className="ui-input" value={item.timezone} onChange={(event) => set("timezone")(event.target.value)}>
                    <option value="Africa/Lagos">West Africa Time (WAT, UTC+1)</option>
                  </select>
                )}
              </Field>
              <Field id="field-registrationClosesAt" label="Registration closes (WAT)" error={errors.registrationClosesAt}>
                {(props) => <input {...props} type="datetime-local" className="ui-input" disabled={started} value={toWatInput(item.registrationClosesAt)} onChange={(event) => set("registrationClosesAt")(fromWatInput(event.target.value))} />}
              </Field>
            </div>
          </EditorCard>

          <EditorCard title="Participation">
            <RadioPill
              name="hackathon-participation"
              legend="Who takes part"
              value={item.participation}
              onChange={(value) => !started && set("participation")(value)}
              options={[{ value: "individual", label: "Individual" }, { value: "teams", label: "Teams" }]}
            />
            {item.participation === "teams" && (
              <div className="community-field-grid">
                <Field id="field-minTeam" label="Minimum team size" error={errors.minTeam}>
                  {(props) => <input {...props} type="number" inputMode="numeric" min={2} max={6} className="ui-input" disabled={started} value={item.minTeam} onChange={(event) => set("minTeam")(event.target.value === "" ? "" : Number(event.target.value))} />}
                </Field>
                <Field id="field-maxTeam" label="Maximum team size" error={errors.maxTeam}>
                  {(props) => <input {...props} type="number" inputMode="numeric" min={2} max={6} className="ui-input" disabled={started} value={item.maxTeam} onChange={(event) => set("maxTeam")(event.target.value === "" ? "" : Number(event.target.value))} />}
                </Field>
              </div>
            )}
            <div className="cae-half">
              <Field id="field-participantLimit" label="Participant limit" optional error={errors.participantLimit} hint="Leave empty for no limit.">
                {(props) => <input {...props} type="number" inputMode="numeric" min={1} className="ui-input" value={item.participantLimit ?? ""} onChange={(event) => set("participantLimit")(event.target.value === "" ? "" : Number(event.target.value))} />}
              </Field>
            </div>
          </EditorCard>

          <CriteriaCard item={item} set={set} errors={errors} />
        </div>

        <aside className="community-editor-side">
          <PrizesCard prizes={item.prizes} onChange={set("prizes")} error={errors.prizes} />
          <JudgesCard judges={item.judges} pool={judgePool} onChange={set("judges")} error={errors.judges} />
          <EditorCard title={isDraft ? "Schedule" : "Save"}>
            <p className="cae-side-text">
              {isDraft
                ? "Scheduling publishes the hackathon page now, opens registration and sends a community announcement."
                : "This hackathon is public. Registered students are told about important changes."}
            </p>
            <div className="cae-side-actions">
              {isDraft ? (
                <>
                  <button type="button" className="btn btn-primary" onClick={() => save("scheduled")} disabled={Boolean(busy)}>{busy === "schedule" ? "Scheduling…" : "Schedule hackathon"}</button>
                  <button type="submit" className="btn btn-outline" disabled={Boolean(busy)}>{busy === "save" ? "Saving…" : "Save draft"}</button>
                </>
              ) : (
                <button type="submit" className="btn btn-primary" disabled={Boolean(busy) || !dirty}>{busy === "save" ? "Saving…" : "Save changes"}</button>
              )}
              {!isNew && !isDraft && (
                <>
                  <Link to={`${LIST_PATH}/${encodeURIComponent(item.id)}/participants`} className="btn btn-outline">Participants</Link>
                  <Link to={`${LIST_PATH}/${encodeURIComponent(item.id)}/submissions`} className="btn btn-outline">Submissions</Link>
                </>
              )}
              {!isNew && isDraft && <button type="button" className="btn btn-outline community-btn-danger-outline" onClick={() => setDeleteOpen(true)} disabled={Boolean(busy)}>Delete draft</button>}
              <Link to={LIST_PATH} className="btn btn-ghost">Cancel</Link>
            </div>
          </EditorCard>
        </aside>
      </form>

      <Modal open={deleteOpen} onClose={() => busy !== "delete" && setDeleteOpen(false)} title={`Delete “${JSON.parse(saved).title || "this draft"}”?`}>
        <div className="community-delete-dialog">
          <span className="community-delete-icon" aria-hidden="true"><Trash2 size={22} /></span>
          <p>This draft has never been scheduled, so no student has seen it. Deleting it cannot be undone.</p>
          <div className="community-delete-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setDeleteOpen(false)} disabled={busy === "delete"}>Cancel</button>
            <button type="button" className="btn btn-sm community-btn-danger" onClick={remove} disabled={busy === "delete"}>{busy === "delete" ? "Deleting…" : "Delete draft"}</button>
          </div>
        </div>
      </Modal>
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

function BannerField({ url, onChange, sample, onError }) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function handle(files) {
    const [file] = [...files];
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) { onError({ type: "error", message: `${file.name} isn't a PNG or JPG image.` }); return; }
    if (file.size > 5 * MB) { onError({ type: "error", message: `${file.name} is larger than 5 MB.` }); return; }
    setUploading(true);
    try {
      const uploaded = await uploadEventImage(file, { sample });
      onChange(uploaded.url);
    } catch (uploadError) {
      onError({ type: "error", message: uploadError.message || "The upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="community-field">
      <span className="cae-label" id="banner-label">Banner image</span>
      {url ? (
        <div className="community-thumb-preview cae-banner-preview">
          <img src={url} alt="Hackathon banner" />
          <div className="cae-actions">
            <label className="btn btn-outline btn-sm">Replace image<input type="file" className="sr-only" accept={IMAGE_TYPES.join(",")} onChange={(event) => { handle(event.target.files); event.target.value = ""; }} /></label>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange("")}>Remove</button>
          </div>
        </div>
      ) : (
        <label
          className={`community-dropzone${dragging ? " is-dragging" : ""}`}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); handle(event.dataTransfer.files); }}
        >
          <Upload size={22} aria-hidden="true" />
          <strong>{uploading ? "Uploading…" : <>Drag an image here or <span>browse files</span></>}</strong>
          <span>PNG or JPG, 1600 × 600 px recommended, up to 5 MB</span>
          <input type="file" className="sr-only" aria-labelledby="banner-label" accept={IMAGE_TYPES.join(",")} disabled={uploading} onChange={(event) => { handle(event.target.files); event.target.value = ""; }} />
        </label>
      )}
    </div>
  );
}

function CriteriaCard({ item, set, errors }) {
  const criteria = item.criteria.length ? item.criteria : [{ name: "", weight: "" }];
  const total = criteriaTotal(criteria);
  const update = (index, changes) => set("criteria")(criteria.map((criterion, i) => (i === index ? { ...criterion, ...changes } : criterion)));
  return (
    <EditorCard
      title="Evaluation criteria"
      aside={<button type="button" className="btn btn-outline btn-sm" onClick={() => set("criteria")([...criteria, { name: "", weight: "" }])}><Plus size={15} aria-hidden="true" /> Add criterion</button>}
    >
      <fieldset id="field-criteria" tabIndex={-1} className="community-fieldset">
        <legend className="sr-only">Criteria and weights</legend>
        <div className="community-criteria-head" aria-hidden="true"><span>Criterion</span><span>Weight %</span></div>
        <div className="community-repeat-list">
          {criteria.map((criterion, index) => (
            <div key={index} className="community-repeat-row community-criterion">
              <input className="ui-input" aria-label={`Criterion ${index + 1}`} placeholder="What will judges score?" value={criterion.name} onChange={(event) => update(index, { name: event.target.value })} />
              <input
                className="ui-input"
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                aria-label={`Criterion ${index + 1} weight, percent`}
                aria-invalid={Boolean(errors.criteria) && total !== 100}
                value={criterion.weight}
                onChange={(event) => update(index, { weight: event.target.value === "" ? "" : Math.max(0, Math.min(100, Number(event.target.value))) })}
              />
              <button type="button" className="community-icon-button" aria-label={`Remove criterion ${index + 1}`} disabled={criteria.length === 1} onClick={() => set("criteria")(criteria.filter((_, i) => i !== index))}><Trash2 size={15} aria-hidden="true" /></button>
            </div>
          ))}
        </div>
        <div className="community-criteria-total">
          {errors.criteria ? <p className="field-error">{errors.criteria}</p> : <span />}
          <strong className={total === 100 ? "is-good" : "is-bad"} aria-live="polite">
            {total === 100 ? <><Check size={15} aria-hidden="true" /> Weights total 100%</> : `Weights total ${total}% of 100%`}
          </strong>
        </div>
      </fieldset>
      <Field id="field-submissionInstructions" label="Submission instructions" error={errors.submissionInstructions}>
        {(props) => <textarea {...props} className="ui-input" rows={3} value={item.submissionInstructions} onChange={(event) => set("submissionInstructions")(event.target.value)} />}
      </Field>
    </EditorCard>
  );
}

function PrizesCard({ prizes, onChange, error }) {
  const set = (field) => (value) => onChange({ ...prizes, [field]: value });
  return (
    <EditorCard title="Prizes">
      <div className="cae-first-prize">
        <div className="cae-first-prize-head">
          <label htmlFor="field-prizes">1st place</label>
          {prizes.grantPremium && <Tag tone="purple">Premium reward</Tag>}
        </div>
        <input
          id="field-prizes"
          className="ui-input"
          value={prizes.first}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "prizes-error" : undefined}
          onChange={(event) => set("first")(event.target.value)}
        />
        <label className="cae-switch">
          <input type="checkbox" role="switch" checked={prizes.grantPremium} onChange={(event) => set("grantPremium")(event.target.checked)} />
          <span className="cae-switch-track" aria-hidden="true" />
          <span>Grant 1 month Premium automatically when results are published</span>
        </label>
        {error && <p id="prizes-error" className="field-error">{error}</p>}
      </div>
      <div className="community-field">
        <label className="cae-label" htmlFor="prize-second">2nd place</label>
        <input id="prize-second" className="ui-input" value={prizes.second} onChange={(event) => set("second")(event.target.value)} />
      </div>
      <div className="community-field">
        <label className="cae-label" htmlFor="prize-third">3rd place</label>
        <input id="prize-third" className="ui-input" value={prizes.third} onChange={(event) => set("third")(event.target.value)} />
      </div>
      <label className="community-checkbox cae-small-check"><input type="checkbox" checked={prizes.certificate} onChange={(event) => set("certificate")(event.target.checked)} /> Participation certificate for every valid submission</label>
      <label className="community-checkbox cae-small-check"><input type="checkbox" checked={prizes.featureWinners} onChange={(event) => set("featureWinners")(event.target.checked)} /> Feature winners in Project Showcase</label>
    </EditorCard>
  );
}

function JudgesCard({ judges, pool, onChange, error }) {
  const available = pool.filter((judge) => !judges.some((item) => item.id === judge.id));
  return (
    <EditorCard title="Judges">
      <div className="community-field">
        <label className="cae-label" htmlFor="field-judges">Assign judges</label>
        <div className="cae-judges">
          {judges.length > 0 && (
            <ul aria-label="Assigned judges">
              {judges.map((judge) => (
                <li key={judge.id} className="community-skill-chip">
                  <span className="cae-judge-initials" aria-hidden="true">{judge.initials}</span>
                  {judge.name}
                  <button type="button" aria-label={`Remove ${judge.name}`} onClick={() => onChange(judges.filter((item) => item.id !== judge.id))}><X size={13} aria-hidden="true" /></button>
                </li>
              ))}
            </ul>
          )}
          <select
            id="field-judges"
            className="ui-input"
            value=""
            aria-invalid={Boolean(error)}
            aria-describedby={`judges-hint${error ? " judges-error" : ""}`}
            disabled={available.length === 0}
            onChange={(event) => {
              const judge = pool.find((item) => item.id === event.target.value);
              if (judge) onChange([...judges, judge]);
            }}
          >
            <option value="">{available.length ? "Add judge…" : "Everyone is assigned"}</option>
            {available.map((judge) => <option key={judge.id} value={judge.id}>{judge.name}</option>)}
          </select>
        </div>
        {error && <p id="judges-error" className="field-error">{error}</p>}
        <p id="judges-hint" className="cae-hint">Judges score submissions independently. Only admins can publish official results.</p>
      </div>
    </EditorCard>
  );
}
