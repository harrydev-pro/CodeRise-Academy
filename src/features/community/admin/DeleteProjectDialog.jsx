import { useState } from "react";
import { Trash2 } from "lucide-react";

import Modal from "../../../components/common/Modal";

// "Delete project" confirmation from the A04 design: the admin types DELETE to confirm, and can
// unpublish instead, which hides the project but keeps everything.
// - titles: one title, or several when deleting a selection from the list.
// - submissions: how many submissions are linked (shown as a warning when > 0).
export default function DeleteProjectDialog({ open, titles = [], submissions = 0, onCancel, onDelete, onUnpublish }) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const many = titles.length > 1;
  const name = many ? `${titles.length} projects` : `“${titles[0] ?? "this project"}”`;

  function close() {
    if (busy) return;
    setTyped("");
    setError("");
    onCancel();
  }

  async function run(kind, action) {
    setBusy(kind);
    setError("");
    try {
      await action();
      setTyped("");
    } catch (actionError) {
      setError(actionError.message || "That didn't work. Please try again.");
    } finally {
      setBusy("");
    }
  }

  return (
    <Modal open={open} onClose={close} title={`Delete ${name}?`} size="max-w-lg">
      <div className="community-delete-dialog">
        <span className="community-delete-icon" aria-hidden="true"><Trash2 size={22} /></span>
        <p>
          This removes {many ? "these projects" : "the project"} from the Project Library. Students who started {many ? "them" : "it"} will
          no longer be able to open the brief.
        </p>
        {submissions > 0 && (
          <p className="community-delete-warning">
            {submissions} {submissions === 1 ? "submission is" : "submissions are"} linked to {many ? "these projects" : "this project"}. Their scores
            and feedback stay in student records, but nobody can submit again. Unpublishing hides {many ? "them" : "the project"} and keeps everything instead.
          </p>
        )}
        <label htmlFor="delete-confirm">Type DELETE to confirm</label>
        <input id="delete-confirm" className="ui-input" value={typed} autoComplete="off" placeholder="DELETE" onChange={(event) => setTyped(event.target.value)} />
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="community-delete-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={close} disabled={Boolean(busy)}>Cancel</button>
          {onUnpublish && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => run("unpublish", onUnpublish)} disabled={Boolean(busy)}>
              {busy === "unpublish" ? "Unpublishing…" : "Unpublish instead"}
            </button>
          )}
          <button type="button" className="btn btn-sm community-btn-danger" onClick={() => run("delete", onDelete)} disabled={typed.trim() !== "DELETE" || Boolean(busy)}>
            {busy === "delete" ? "Deleting…" : many ? `Delete ${titles.length} projects` : "Delete project"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
