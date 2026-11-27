import { useState } from "react";
import { ClipboardList, Plus } from "lucide-react";

import Loader from "../../../components/common/Loader";
import Modal from "../../../components/common/Modal";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { useCommunityList } from "../../../features/community/listHooks";
import { Avatar, TaskLabel, TaskStatusTag } from "../../../features/community/teams/teamComponents";
import { firstName, formatDueDate, fullDate, todayKey, useTeamWorkspace } from "../../../features/community/teams/teamHelpers";
import { createTask, deleteTask, getTeamTasks, TASK_COLUMNS, updateTask } from "../../../features/community/teams/teamsService";

const TITLE_MAX = 120;
const DETAILS_MAX = 1000;
const NEXT_STEP = {
  todo: { status: "in_progress", label: "Start" },
  in_progress: { status: "done", label: "Mark done" },
};

// S10 Tasks: /community/teams/:teamId/tasks
export default function TeamTasks() {
  const { team, sample, reloadTeam, notify } = useTeamWorkspace();
  const { data, error, loading, refreshing, reload } = useCommunityList(getTeamTasks, { teamId: team.id });
  const [assignee, setAssignee] = useState("");
  const [creating, setCreating] = useState(false);
  const [openTaskId, setOpenTaskId] = useState("");
  const [busy, setBusy] = useState("");

  if (loading) return <Loader label="Loading task board…" />;
  if (error && !data) return <ErrorMessage message={error} onRetry={reload} />;

  const tasks = data.tasks;
  const shown = tasks.filter((task) => !assignee || task.assignee === assignee);
  const done = tasks.filter((task) => task.status === "done").length;
  const openTask = tasks.find((task) => task.id === openTaskId) ?? null;
  const memberName = (username) => team.members.find((member) => member.username === username)?.name ?? "Unassigned";
  const columnLabel = (status) => TASK_COLUMNS.find((column) => column.value === status)?.label ?? status;

  function refresh() {
    reload();
    reloadTeam();
  }

  async function move(task, status) {
    setBusy(task.id);
    try {
      await updateTask(team.id, task.id, { status }, { sample });
      notify({ type: "success", message: `“${task.title}” moved to ${columnLabel(status)}.` });
      refresh();
    } catch (moveError) {
      notify({ type: "error", message: moveError.message || "The task could not be moved." });
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="cmt-tasks">
      <div className="cmt-toolbar">
        <div className="min-w-0">
          <h2 className="cmt-section-title">Task board</h2>
          <p className="cmt-card-sub">{done} of {tasks.length} tasks done. Use the buttons on each card, or open a task, to move it.</p>
        </div>
        <div className="cmt-toolbar-actions">
          <label className="cmt-inline-field">
            <span>Assignee</span>
            <select className="ui-input" value={assignee} onChange={(event) => setAssignee(event.target.value)}>
              <option value="">Everyone</option>
              {team.members.map((member) => (
                <option key={member.username} value={member.username}>{member.username === team.viewerUsername ? `${member.name} (you)` : member.name}</option>
              ))}
            </select>
          </label>
          <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={17} aria-hidden="true" /> New task</button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="community-card community-empty">
          <span className="community-icon tone-blue"><ClipboardList size={22} aria-hidden="true" /></span>
          <h2>No tasks yet</h2>
          <p className="muted-text">Break the brief into small tasks and give each one an owner and a due date.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>Add the first task</button>
        </div>
      ) : (
        <div className={`cmt-board${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing}>
          {TASK_COLUMNS.map((column) => {
            const items = shown.filter((task) => task.status === column.value).sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
            return (
              <section key={column.value} className="cmt-column" aria-labelledby={`column-${column.value}`}>
                <h3 id={`column-${column.value}`} className="cmt-column-title">
                  {column.label}
                  <span className="cmt-column-count" aria-label={`${items.length} tasks`}>{items.length}</span>
                </h3>
                {items.length === 0 ? (
                  <p className="cmt-column-empty">{assignee ? "No tasks for this person." : "Nothing here."}</p>
                ) : (
                  <ul className="cmt-task-list">
                    {items.map((task) => {
                      const step = NEXT_STEP[task.status];
                      const overdue = task.status !== "done" && task.dueDate && task.dueDate < todayKey();
                      return (
                        <li key={task.id} className="cmt-task">
                          <div className="cmt-task-top">
                            <TaskLabel label={task.label} />
                            {task.dueDate && <span className={`cmt-task-due${overdue ? " is-overdue" : ""}`}>{overdue ? "Overdue · " : ""}{formatDueDate(task.dueDate)}</span>}
                          </div>
                          <h4>
                            <button type="button" className="cmt-task-open" onClick={() => setOpenTaskId(task.id)}>{task.title}</button>
                          </h4>
                          <div className="cmt-task-bottom">
                            <span className="cmt-task-assignee">
                              <Avatar name={memberName(task.assignee)} username={task.assignee} viewer={task.assignee === team.viewerUsername} size="sm" />
                              {firstName(memberName(task.assignee))}
                            </span>
                            {step ? (
                              <button type="button" className="btn btn-outline btn-sm" disabled={busy === task.id} aria-label={`${step.label}: ${task.title}`} onClick={() => move(task, step.status)}>
                                {busy === task.id ? "Moving…" : step.label}
                              </button>
                            ) : (
                              <span className="community-tag tag-green">Done</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      <TaskFormDialog
        open={creating}
        title="New task"
        submitLabel="Add task"
        members={team.members}
        initial={{ title: "", details: "", assignee: team.viewerUsername, dueDate: "", status: "todo" }}
        onClose={() => setCreating(false)}
        onSubmit={async (values) => {
          await createTask(team.id, values, { sample });
          setCreating(false);
          notify({ type: "success", message: `Task added to ${columnLabel(values.status)}.` });
          refresh();
        }}
      />

      <TaskDetailDialog
        key={openTask?.id ?? "none"}
        task={openTask}
        team={team}
        memberName={memberName}
        columnLabel={columnLabel}
        onClose={() => setOpenTaskId("")}
        onSave={async (changes) => {
          await updateTask(team.id, openTask.id, changes, { sample });
          notify({ type: "success", message: "Task updated." });
          refresh();
        }}
        onDelete={async () => {
          await deleteTask(team.id, openTask.id, { sample });
          setOpenTaskId("");
          notify({ type: "success", message: "Task deleted." });
          refresh();
        }}
      />
    </div>
  );
}

function validateTask(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = "Give the task a title.";
  else if (values.title.trim().length > TITLE_MAX) errors.title = `Keep the title under ${TITLE_MAX} characters.`;
  if (values.details.length > DETAILS_MAX) errors.details = `Details can be up to ${DETAILS_MAX} characters.`;
  if (!values.assignee) errors.assignee = "Choose who will do this task.";
  return errors;
}

function TaskFormDialog({ open, title, submitLabel, members, initial, onClose, onSubmit }) {
  if (!open) return null;
  return <TaskForm title={title} submitLabel={submitLabel} members={members} initial={initial} onClose={onClose} onSubmit={onSubmit} />;
}

function TaskForm({ title, submitLabel, members, initial, onClose, onSubmit, inline = false }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const idPrefix = inline ? "edit-task" : "new-task";

  function change(next) {
    const updated = { ...values, ...next };
    setValues(updated);
    if (Object.keys(errors).length) setErrors(validateTask(updated));
  }

  async function submit(event) {
    event.preventDefault();
    const found = validateTask(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    setFormError("");
    try {
      await onSubmit({ ...values, title: values.title.trim(), details: values.details.trim() });
    } catch (submitError) {
      setFormError(submitError.message || "The task could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const form = (
    <form className="cmt-dialog-form" onSubmit={submit} noValidate>
      <div className="community-field">
        <label htmlFor={`${idPrefix}-title`} className="cmt-label">Title</label>
        <input id={`${idPrefix}-title`} className="ui-input" value={values.title} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? `${idPrefix}-title-error` : undefined} onChange={(event) => change({ title: event.target.value })} />
        {errors.title && <p id={`${idPrefix}-title-error`} className="field-error">{errors.title}</p>}
      </div>
      <div className="community-field">
        <label htmlFor={`${idPrefix}-details`} className="cmt-label">Details</label>
        <textarea id={`${idPrefix}-details`} className="ui-input" rows={3} value={values.details} aria-invalid={Boolean(errors.details)} aria-describedby={errors.details ? `${idPrefix}-details-error` : undefined} onChange={(event) => change({ details: event.target.value })} />
        {errors.details && <p id={`${idPrefix}-details-error`} className="field-error">{errors.details}</p>}
      </div>
      <div className="cmt-field-pair">
        <div className="community-field">
          <label htmlFor={`${idPrefix}-assignee`} className="cmt-label">Assign to</label>
          <select id={`${idPrefix}-assignee`} className="ui-input" value={values.assignee} aria-invalid={Boolean(errors.assignee)} onChange={(event) => change({ assignee: event.target.value })}>
            <option value="">Choose a member</option>
            {members.map((member) => <option key={member.username} value={member.username}>{member.name}</option>)}
          </select>
          {errors.assignee && <p className="field-error">{errors.assignee}</p>}
        </div>
        <div className="community-field">
          <label htmlFor={`${idPrefix}-due`} className="cmt-label">Due date</label>
          <input id={`${idPrefix}-due`} type="date" className="ui-input" value={values.dueDate} onChange={(event) => change({ dueDate: event.target.value })} />
        </div>
      </div>
      <div className="community-field">
        <label htmlFor={`${idPrefix}-status`} className="cmt-label">Column</label>
        <select id={`${idPrefix}-status`} className="ui-input" value={values.status} onChange={(event) => change({ status: event.target.value })}>
          {TASK_COLUMNS.map((column) => <option key={column.value} value={column.value}>{column.label}</option>)}
        </select>
      </div>
      {formError && <p className="field-error" role="alert">{formError}</p>}
      <div className="cmt-dialog-actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : submitLabel}</button>
      </div>
    </form>
  );

  if (inline) return form;
  return <Modal open onClose={onClose} title={title}>{form}</Modal>;
}

function TaskDetailDialog({ task, team, memberName, columnLabel, onClose, onSave, onDelete }) {
  const [mode, setMode] = useState("view");
  const [working, setWorking] = useState("");
  const [error, setError] = useState("");
  if (!task) return null;

  async function run(kind, action) {
    setWorking(kind);
    setError("");
    try {
      await action();
      setMode("view");
    } catch (actionError) {
      setError(actionError.message || "That change could not be saved.");
    } finally {
      setWorking("");
    }
  }

  const canDelete = team.viewerIsLeader || task.createdBy === team.viewerUsername;

  return (
    <Modal open onClose={onClose} title={mode === "edit" ? "Edit task" : task.title} size="max-w-xl">
      {mode === "edit" ? (
        <TaskForm
          inline
          submitLabel="Save task"
          members={team.members}
          initial={{ title: task.title, details: task.details ?? "", assignee: task.assignee, dueDate: task.dueDate ?? "", status: task.status }}
          onClose={() => setMode("view")}
          onSubmit={async (values) => { await onSave(values); setMode("view"); }}
        />
      ) : mode === "delete" ? (
        <div className="community-delete-dialog">
          <p>Delete <strong>“{task.title}”</strong>? It disappears from the board for everyone in {team.name}. This cannot be undone.</p>
          {error && <p className="field-error" role="alert">{error}</p>}
          <div className="community-delete-actions">
            <button type="button" className="btn btn-outline" onClick={() => setMode("view")}>Cancel</button>
            <button type="button" className="btn community-btn-danger" disabled={working === "delete"} onClick={() => run("delete", onDelete)}>
              {working === "delete" ? "Deleting…" : "Delete task"}
            </button>
          </div>
        </div>
      ) : (
        <div className="cmt-task-detail">
          <div className="community-tags">
            <TaskLabel label={task.label} />
            <TaskStatusTag status={task.status} />
          </div>
          <dl className="cmt-summary">
            <div><dt>Assigned to</dt><dd>{memberName(task.assignee)}</dd></div>
            <div><dt>Due</dt><dd>{task.dueDate ? fullDate.format(new Date(`${task.dueDate}T12:00:00Z`)) : "No due date"}</dd></div>
            <div><dt>Created by</dt><dd>{memberName(task.createdBy)}</dd></div>
          </dl>
          <div>
            <h3 className="cmt-label">Details</h3>
            <p className="cmt-detail-text">{task.details || "No details yet."}</p>
          </div>
          <fieldset className="cmt-move">
            <legend className="cmt-label">Move to</legend>
            <div className="cmt-button-row">
              {TASK_COLUMNS.filter((column) => column.value !== task.status).map((column) => (
                <button key={column.value} type="button" className="btn btn-outline btn-sm" disabled={Boolean(working)} onClick={() => run(column.value, () => onSave({ status: column.value }))}>
                  {working === column.value ? "Moving…" : columnLabel(column.value)}
                </button>
              ))}
            </div>
          </fieldset>
          {error && <p className="field-error" role="alert">{error}</p>}
          <div className="cmt-dialog-actions cmt-dialog-actions-split">
            {canDelete ? <button type="button" className="btn btn-outline btn-sm community-btn-danger-outline" onClick={() => setMode("delete")}>Delete</button> : <span />}
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setMode("edit")}>Edit task</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
