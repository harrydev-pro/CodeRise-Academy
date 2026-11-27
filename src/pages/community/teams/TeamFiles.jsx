import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FolderPlus, Link2, Trash2, UploadCloud } from "lucide-react";

import Loader from "../../../components/common/Loader";
import Modal from "../../../components/common/Modal";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { useCommunityList } from "../../../features/community/listHooks";
import { FileAction, FileIcon } from "../../../features/community/teams/teamComponents";
import { formatBytes, formatUpdated, isHttpUrl, useTeamWorkspace } from "../../../features/community/teams/teamHelpers";
import {
  addTeamLink,
  createTeamFolder,
  deleteTeamFile,
  getTeamFiles,
  kindFromUrl,
  TEAM_FILE_LIMIT_BYTES,
  uploadTeamFile,
} from "../../../features/community/teams/teamsService";

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.gif,.webp,.svg,.zip,.fig,.md,.txt,.docx,.xlsx,.pptx,.csv";

// S09c Shared files: /community/teams/:teamId/files?folder=
export default function TeamFiles() {
  const { team, sample, notify } = useTeamWorkspace();
  const [params, setParams] = useSearchParams();
  const folder = params.get("folder") ?? "";
  const { data, error, loading, refreshing, reload } = useCommunityList(getTeamFiles, { teamId: team.id, folder });
  const [uploadFolder, setUploadFolder] = useState("");
  const [uploading, setUploading] = useState("");
  const [uploadError, setUploadError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dialog, setDialog] = useState(null); // "folder" | "link" | { delete: file }

  if (loading) return <Loader label="Loading shared files…" />;
  if (error && !data) return <ErrorMessage message={error} onRetry={reload} />;

  const targetFolder = uploadFolder || folder || data.folders[0]?.id || "";
  const folderName = (id) => data.folders.find((item) => item.id === id)?.name ?? "—";
  const currentFolderName = folder ? folderName(folder) : "All files";

  async function upload(fileList) {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;
    setUploadError(null);
    for (const file of files) {
      if (file.size > TEAM_FILE_LIMIT_BYTES) {
        setUploadError({ name: file.name, size: file.size });
        continue;
      }
      setUploading(file.name);
      try {
        await uploadTeamFile(team.id, file, { folderId: targetFolder }, { sample });
        notify({ type: "success", message: `${file.name} shared with ${team.name}.` });
      } catch (uploadFailure) {
        setUploadError({ name: file.name, size: file.size, message: uploadFailure.message });
      }
    }
    setUploading("");
    reload();
  }

  return (
    <div className="cmt-layout cmt-layout-wide">
      <section className="community-card cmt-files-card" aria-labelledby="files-heading">
        <div className="cmt-files-head">
          <div className="min-w-0">
            <h2 id="files-heading" className="cmt-card-title">Shared files{folder ? ` · ${currentFolderName}` : ""}</h2>
            <p className="cmt-card-sub">{data.total} files · {formatBytes(data.storage.usedBytes)} of {formatBytes(data.storage.limitBytes)} team storage</p>
          </div>
          <div className="cmt-button-row">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setDialog("folder")}><FolderPlus size={15} aria-hidden="true" /> New folder</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setDialog("link")}><Link2 size={15} aria-hidden="true" /> Add link</button>
            <label className="btn btn-primary btn-sm cmt-upload-button">
              <UploadCloud size={15} aria-hidden="true" /> Upload file
              <input type="file" className="sr-only" accept={ACCEPT} multiple onChange={(event) => { upload(event.target.files); event.target.value = ""; }} />
            </label>
          </div>
        </div>

        <div
          className={`cmt-dropzone${dragging ? " is-dragging" : ""}`}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); upload(event.dataTransfer.files); }}
        >
          <strong>Drop files here to share with {team.name}</strong>
          <span>PDF, PNG, JPG, ZIP, FIG and docs · max 25 MB per file. Bigger files? Add a link instead.</span>
          <label className="cmt-inline-field">
            <span>Save to</span>
            <select className="ui-input" value={targetFolder} onChange={(event) => setUploadFolder(event.target.value)}>
              {data.folders.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          {uploading && <p className="cmt-muted-small" role="status">Uploading {uploading}…</p>}
        </div>

        {data.files.length === 0 ? (
          <div className="community-empty cmt-empty-tight">
            <h3>No files {folder ? "in this folder" : "yet"}</h3>
            <p className="muted-text">Upload a file or add a GitHub, Figma or Drive link.</p>
          </div>
        ) : (
          <div className={`community-table-wrap${refreshing ? " is-refreshing" : ""}`} tabIndex={0} role="region" aria-label="Shared files (scrolls sideways)">
            <table className="community-table cmt-files-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Folder</th>
                  <th scope="col">Added by</th>
                  <th scope="col">Updated</th>
                  <th scope="col">Size</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {data.files.map((file) => (
                  <tr key={file.id}>
                    <td>
                      <span className="cmt-file-cell">
                        <FileIcon kind={file.kind} />
                        <span className="cmt-file-name">
                          <strong>{file.name}</strong>
                          <small>{file.note}</small>
                        </span>
                      </span>
                    </td>
                    <td>{folderName(file.folderId)}</td>
                    <td>{file.addedBy.name}</td>
                    <td>{formatUpdated(file.updatedAt)}</td>
                    <td>{file.type === "link" ? "—" : formatBytes(file.size)}</td>
                    <td>
                      <span className="cmt-row-actions">
                        <FileAction file={file} />
                        {file.viewerCanDelete && (
                          <button type="button" className="community-icon-button" aria-label={`Delete ${file.name}`} onClick={() => setDialog({ delete: file })}>
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <aside className="cmt-side" aria-label="Folders and activity">
        <section className="community-card" aria-labelledby="folders-title">
          <h2 id="folders-title" className="cmt-card-title">Folders</h2>
          <ul className="cmt-nav-list">
            {[{ id: "", name: "All files", count: data.total }, ...data.folders].map((item) => (
              <li key={item.id || "all"}>
                <button
                  type="button"
                  className={`cmt-nav-item${folder === item.id ? " active" : ""}`}
                  aria-current={folder === item.id ? "true" : undefined}
                  onClick={() => setParams(item.id ? { folder: item.id } : {})}
                >
                  <span>{item.name}</span>
                  <span className="cmt-nav-count">{item.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="community-card" aria-labelledby="activity-title">
          <h2 id="activity-title" className="cmt-card-title">Recent activity</h2>
          {data.activity.length === 0 ? <p className="cmt-card-sub">Nothing shared yet.</p> : (
            <ul className="cmt-activity">
              {data.activity.map((item) => <li key={item.id}>{item.text} · {formatUpdated(item.at)}</li>)}
            </ul>
          )}
        </section>

        {uploadError && (
          <section className="community-card cmt-error-card" aria-labelledby="upload-failed-title" role="alert">
            <h2 id="upload-failed-title" className="cmt-card-title">Upload failed</h2>
            <p>
              {uploadError.message || `${uploadError.name} is ${formatBytes(uploadError.size)}. Files must be 25 MB or smaller — share a YouTube or Drive link instead.`}
            </p>
            <div className="cmt-button-row">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setDialog("link")}>Add a link</button>
              <button type="button" className="cmt-text-button" onClick={() => setUploadError(null)}>Dismiss</button>
            </div>
          </section>
        )}
      </aside>

      {dialog === "folder" && (
        <FolderDialog
          onClose={() => setDialog(null)}
          onSubmit={async (name) => {
            await createTeamFolder(team.id, { name }, { sample });
            setDialog(null);
            notify({ type: "success", message: `Folder “${name}” created.` });
            reload();
          }}
        />
      )}
      {dialog === "link" && (
        <LinkDialog
          folders={data.folders}
          defaultFolder={targetFolder}
          onClose={() => setDialog(null)}
          onSubmit={async (values) => {
            await addTeamLink(team.id, values, { sample });
            setDialog(null);
            setUploadError(null);
            notify({ type: "success", message: `${values.name} added.` });
            reload();
          }}
        />
      )}
      {dialog?.delete && (
        <DeleteFileDialog
          file={dialog.delete}
          teamName={team.name}
          onClose={() => setDialog(null)}
          onConfirm={async () => {
            await deleteTeamFile(team.id, dialog.delete.id, { sample });
            setDialog(null);
            notify({ type: "success", message: `${dialog.delete.name} deleted.` });
            reload();
          }}
        />
      )}
    </div>
  );
}

function FolderDialog({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const clean = name.trim();
    if (!clean || clean.length > 40) { setError("Give the folder a name of 1–40 characters."); return; }
    setSaving(true);
    setError("");
    try {
      await onSubmit(clean);
    } catch (submitError) {
      setError(submitError.message || "The folder could not be created.");
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="New folder">
      <form className="cmt-dialog-form" onSubmit={submit} noValidate>
        <div className="community-field">
          <label htmlFor="folder-name" className="cmt-label">Folder name</label>
          <input id="folder-name" className="ui-input" value={name} maxLength={50} aria-invalid={Boolean(error)} aria-describedby={error ? "folder-name-error" : undefined} onChange={(event) => setName(event.target.value)} autoFocus />
          {error && <p id="folder-name-error" className="field-error">{error}</p>}
        </div>
        <div className="cmt-dialog-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Creating…" : "Create folder"}</button>
        </div>
      </form>
    </Modal>
  );
}

const LINK_KIND_LABEL = { github: "GitHub repository", figma: "Figma file", drive: "Google Drive", video: "Video", link: "Web link" };

function LinkDialog({ folders, defaultFolder, onClose, onSubmit }) {
  const [values, setValues] = useState({ name: "", url: "", folderId: defaultFolder });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const kind = isHttpUrl(values.url) ? kindFromUrl(values.url) : "";

  async function submit(event) {
    event.preventDefault();
    const found = {};
    if (!values.name.trim()) found.name = "Give the link a name, for example “Checkout flow (Figma)”.";
    if (!isHttpUrl(values.url.trim())) found.url = "Enter a full link that starts with https://";
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    setFormError("");
    try {
      await onSubmit({ name: values.name.trim(), url: values.url.trim(), folderId: values.folderId });
    } catch (submitError) {
      setFormError(submitError.message || "The link could not be added.");
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Add a link" description="Share a GitHub repository, Figma file, Google Drive folder or video with your team.">
      <form className="cmt-dialog-form" onSubmit={submit} noValidate>
        <div className="community-field">
          <label htmlFor="link-url" className="cmt-label">Link</label>
          <input id="link-url" type="url" className="ui-input" placeholder="https://" value={values.url} aria-invalid={Boolean(errors.url)} aria-describedby={errors.url ? "link-url-error" : kind ? "link-kind" : undefined} onChange={(event) => setValues({ ...values, url: event.target.value })} />
          {kind && !errors.url && <p id="link-kind" className="community-field-hint">Detected: {LINK_KIND_LABEL[kind]}</p>}
          {errors.url && <p id="link-url-error" className="field-error">{errors.url}</p>}
        </div>
        <div className="community-field">
          <label htmlFor="link-name" className="cmt-label">Name</label>
          <input id="link-name" className="ui-input" maxLength={80} value={values.name} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "link-name-error" : undefined} onChange={(event) => setValues({ ...values, name: event.target.value })} />
          {errors.name && <p id="link-name-error" className="field-error">{errors.name}</p>}
        </div>
        <div className="community-field">
          <label htmlFor="link-folder" className="cmt-label">Folder</label>
          <select id="link-folder" className="ui-input" value={values.folderId} onChange={(event) => setValues({ ...values, folderId: event.target.value })}>
            {folders.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        {formError && <p className="field-error" role="alert">{formError}</p>}
        <div className="cmt-dialog-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Adding…" : "Add link"}</button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteFileDialog({ file, teamName, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setDeleting(true);
    setError("");
    try {
      await onConfirm();
    } catch (deleteError) {
      setError(deleteError.message || "The file could not be deleted.");
      setDeleting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Delete “${file.name}”?`}>
      <div className="community-delete-dialog">
        <span className="community-delete-icon"><Trash2 size={22} aria-hidden="true" /></span>
        <p>It will be removed for everyone in {teamName}. This cannot be undone.</p>
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="community-delete-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="button" className="btn community-btn-danger" disabled={deleting} onClick={confirm}>{deleting ? "Deleting…" : "Delete file"}</button>
        </div>
      </div>
    </Modal>
  );
}
