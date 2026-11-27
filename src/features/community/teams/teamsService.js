import { queryString, uploadFile } from "../../../services/api/api";
import { requestData } from "../../../services/api/dataClient";
import { SAMPLE_COMMUNITY_COLLABORATIONS, SAMPLE_VIEWER_TEAM } from "../sampleCommunityCollaborations";
import {
  buildNewTeam,
  buildTeamNova,
  SAMPLE_KNOWN_USERS,
  SAMPLE_TAKEN_USERNAMES,
  SAMPLE_VIEWER,
  sampleCollaborationDetails,
} from "./sampleTeams";

// Community collaboration teams: Collaboration Details (S07), Create Team (S08) and the Team
// Workspace (S09 Overview, S10 Tasks, S09b Chat, S09c Files, S09d Submission).
//
// ACCESS RULES ARE ENFORCED BY THE BACKEND. The pages only reflect what the API returns:
//   - Premium collaborations: `viewerHasPremium`; join / create return 403 for free members.
//   - Workspace: every /community/teams/:teamId/* endpoint returns 403 unless the viewer is a
//     member; the team payload carries `viewerIsMember` and `viewerIsLeader`.
//   - Leader-only actions (accept / reject requests, edit roles, save the submission, remind,
//     submit) return 403 for other members. One submission per team (409 if already submitted).
//   - Team size: accepting a request or creating a team that would go over `maxMembers`
//     returns 409. One pending join request and one led team per project per learner (409).
//   - Deadline: after `deadline` the submission endpoints return 409.
//
// Endpoints
//   GET    /community/collaborations/:id
//          -> { collaboration: { id, title, teamType, category, brief, skills[], level, duration,
//               access: "free"|"premium", minMembers, maxMembers, deadline (ISO), pointsPerMember,
//               reviewer, roles: [{ id, name, summary, responsibilities, keySkills }],
//               teams: [{ id, name, leaderName, memberInitials[], maxMembers, openRoles: [roleId],
//                        status: "forming"|"active" }], deliverables: [string] },
//               viewerHasPremium, viewerTeam: { id, name } | null,
//               viewerRequest: { teamId, teamName, roleId } | null }
//   POST   /community/collaborations/:id/teams/:teamId/join-requests { roleId, message } -> { request }
//   DELETE /community/collaborations/:id/teams/:teamId/join-requests          (withdraw)
//   GET    /community/collaborations/:id/invite-check?username= -> { ok, username, name, reason }
//   POST   /community/collaborations/:id/teams
//          { name, pitch, size, roleId, openRoleIds[], invites: [{ username, roleId }],
//            visibility: "open"|"invite" } -> { team: { id } }
//
//   GET    /community/teams/:teamId
//          -> { team: { id, name, status: "forming"|"active"|"submitted",
//               collaboration: { id, title, teamType, access }, minMembers, maxMembers, deadline,
//               members: [{ username, name, role, isLeader, online, lastSeenAt, tasksDone, contribution }],
//               invites: [{ username, roleName, status }], progress: { done, total }, openTasks,
//               newMessages, viewerIsMember, viewerIsLeader, viewerUsername } }
//   GET    /community/teams/:teamId/overview
//          -> { dueThisWeek: [task], recentFiles: [file], recentMessages: [message],
//               joinRequests: [{ id, username, name, track, projectsCompleted, roleName, message,
//                               createdAt }] (leader only), confirmations: [{ username, name, confirmedAt }] }
//   POST   /community/teams/:teamId/join-requests/:requestId { decision: "accept"|"reject" }
//   PUT    /community/teams/:teamId/roles { roles: { [username]: role } }
//   GET    /community/teams/:teamId/tasks -> { tasks: [{ id, title, details, label, assignee (username),
//               status: "todo"|"in_progress"|"done", dueDate ("YYYY-MM-DD"), createdBy, createdAt, updatedAt }] }
//   POST   /community/teams/:teamId/tasks { title, details, assignee, dueDate, status } -> { task }
//   PATCH  /community/teams/:teamId/tasks/:taskId { ...changes } -> { task }
//   DELETE /community/teams/:teamId/tasks/:taskId
//   GET    /community/teams/:teamId/chat?channel= -> { channels: [{ id, name, unread }], channel,
//               messages: [{ id, channel, type: "message"|"event", author: { username, name } | null,
//               body, mentions[], attachment: { name, kind, url, size } | null, pinned, createdAt,
//               event?: { kind, title, taskId } }], pinned: [message] }   (marks the channel read)
//   POST   /community/teams/:teamId/messages { channel, body, mentions[], attachment } -> { message }
//   POST / DELETE /community/teams/:teamId/messages/:messageId/pin
//   Reports go to POST /community/reports { targetType: "team_message", ... } (communityService).
//   GET    /community/teams/:teamId/files?folder= -> { files: [{ id, name, type: "file"|"link", kind,
//               note, folderId, addedBy, updatedAt, size, url, readOnly, viewerCanDelete }],
//               folders: [{ id, name, count }], total, storage: { usedBytes, limitBytes },
//               activity: [{ id, text, at }] }
//   POST   /community/teams/:teamId/files { name, url, size, folderId } (after POST /uploads; max 25 MB)
//   POST   /community/teams/:teamId/links { name, url, folderId }
//   POST   /community/teams/:teamId/folders { name } -> { folder }
//   DELETE /community/teams/:teamId/files/:fileId
//   GET    /community/teams/:teamId/submission -> { submission: { status: "draft"|"submitted",
//               links: { github, live, figma, video }, notes, submittedAt, updatedAt },
//               contributions: [{ username, name, role, tasksDone, contribution }],
//               confirmations: [{ username, name, confirmedAt }], openTasks, deadline }
//   PUT    /community/teams/:teamId/submission { links, notes }             (leader, draft)
//   POST   /community/teams/:teamId/submission/confirm                     (each member)
//   POST   /community/teams/:teamId/submission/remind { username }         (leader)
//   POST   /community/teams/:teamId/submission/submit { links, notes, agreed } (leader, once)
//
// On the local dev server, failed requests fall back to an in-memory sample store (the viewer
// is Amara Okafor, leader of Team Nova), so every button can be tried. Changes last until reload.

export const TEAM_FILE_LIMIT_BYTES = 25 * 1024 * 1024;
export const TASK_COLUMNS = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const enc = encodeURIComponent;
const send = (method, path, body) => requestData(path, undefined, { method, body: body === undefined ? undefined : JSON.stringify(body) });
const delay = (value) => new Promise((resolve) => { window.setTimeout(() => resolve(value), 300); });

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Runs a change against the API. On the local dev server, if the API isn't there, the change
// goes to the sample store instead. Real validation / rule errors (400 / 409 / 422) are shown.
async function mutate(real, sampleChange, sample) {
  if (sample) return delay(sampleChange());
  try {
    return await real();
  } catch (error) {
    const missing = !error.status || [401, 403, 404, 405].includes(error.status) || error.status >= 500;
    if (import.meta.env.DEV && missing) return delay(sampleChange());
    throw error;
  }
}

async function read(path, isValid, fallback, notReadyMessage) {
  try {
    const result = await requestData(path);
    if (!isValid(result)) throw new Error(notReadyMessage);
    return { ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) {
      try {
        return { ...fallback(), isSample: true };
      } catch (sampleError) {
        throw new Error(sampleError.message, { cause: sampleError });
      }
    }
    throw error;
  }
}

// ---------- sample store ----------

let store = null;
function sampleStore() {
  if (!store) {
    store = {
      teams: { [SAMPLE_VIEWER_TEAM.id]: buildTeamNova() },
      details: {},
      viewerRequests: {}, // collaborationId -> { teamId, teamName, roleId }
      viewerLeads: { "event-ticketing-website": SAMPLE_VIEWER_TEAM.id }, // collaborationId -> teamId
      nextId: 1,
    };
  }
  return store;
}

function sampleDetails(id) {
  const data = sampleStore();
  if (!data.details[id]) {
    const item = SAMPLE_COMMUNITY_COLLABORATIONS.find((entry) => entry.id === id);
    if (!item) throw new Error("This collaboration project could not be found.");
    data.details[id] = sampleCollaborationDetails(item);
  }
  return data.details[id];
}

function sampleTeam(teamId) {
  const team = sampleStore().teams[teamId];
  if (!team) throw httpError("This team could not be found.", 404);
  return team;
}

const viewerIsLeader = (team) => team.members.some((member) => member.username === SAMPLE_VIEWER.username && member.isLeader);
function requireLeader(team) {
  if (!viewerIsLeader(team)) throw httpError("Only the team leader can do this.", 403);
}

function contributions(team) {
  const done = team.tasks.filter((item) => item.status === "done");
  return team.members.map((member) => {
    const tasksDone = done.filter((item) => item.assignee === member.username).length;
    return { ...member, tasksDone, contribution: done.length ? Math.round((tasksDone / done.length) * 100) : 0 };
  });
}

function teamSummary(team) {
  const collaboration = sampleDetails(team.collaborationId);
  const done = team.tasks.filter((item) => item.status === "done").length;
  return {
    id: team.id,
    name: team.name,
    status: team.submission.status === "submitted" ? "submitted" : team.members.length >= team.minMembers ? "active" : "forming",
    collaboration: { id: collaboration.id, title: collaboration.title, teamType: collaboration.teamType, access: collaboration.access },
    minMembers: team.minMembers,
    maxMembers: team.maxMembers,
    deadline: team.deadline,
    members: contributions(team),
    invites: team.invites,
    progress: { done, total: team.tasks.length },
    openTasks: team.tasks.length - done,
    newMessages: team.channels.reduce((sum, channel) => sum + channel.unread, 0),
    viewerIsMember: true,
    viewerIsLeader: viewerIsLeader(team),
    viewerUsername: SAMPLE_VIEWER.username,
  };
}

const clone = (value) => structuredClone(value);
const nextId = (prefix) => `${prefix}-local-${sampleStore().nextId++}`;

// ---------- S07 Collaboration details ----------

export function getCollaborationDetails({ id }) {
  return read(
    `/community/collaborations/${enc(id)}`,
    (result) => Boolean(result?.collaboration),
    () => {
      const data = sampleStore();
      const collaboration = clone(sampleDetails(id));
      const ledTeamId = data.viewerLeads[id];
      const viewerTeam = ledTeamId ? { id: ledTeamId, name: data.teams[ledTeamId]?.name ?? SAMPLE_VIEWER_TEAM.name } : null;
      return { collaboration, viewerHasPremium: false, viewerTeam, viewerRequest: data.viewerRequests[id] ?? null };
    },
    "This collaboration project is not available yet.",
  );
}

export function requestToJoinTeam(collaborationId, teamId, { roleId, message }, { sample } = {}) {
  return mutate(
    () => send("POST", `/community/collaborations/${enc(collaborationId)}/teams/${enc(teamId)}/join-requests`, { roleId, message }),
    () => {
      const data = sampleStore();
      if (data.viewerRequests[collaborationId]) throw httpError("You already have a pending request for this project.", 409);
      const team = sampleDetails(collaborationId).teams.find((item) => item.id === teamId);
      if (!team || !team.openRoles.includes(roleId)) throw httpError("That position is no longer open.", 409);
      data.viewerRequests[collaborationId] = { teamId, teamName: team.name, roleId };
      return { request: data.viewerRequests[collaborationId] };
    },
    sample,
  );
}

export function withdrawJoinRequest(collaborationId, teamId, { sample } = {}) {
  return mutate(
    () => send("DELETE", `/community/collaborations/${enc(collaborationId)}/teams/${enc(teamId)}/join-requests`),
    () => { delete sampleStore().viewerRequests[collaborationId]; return {}; },
    sample,
  );
}

// ---------- S08 Create team ----------

export function checkInvite(collaborationId, username, { sample } = {}) {
  const clean = username.replace(/^@/, "").trim().toLowerCase();
  return mutate(
    () => requestData(`/community/collaborations/${enc(collaborationId)}/invite-check${queryString({ username: clean })}`),
    () => {
      if (SAMPLE_TAKEN_USERNAMES[clean]) return { ok: false, username: clean, reason: `They are already in ${SAMPLE_TAKEN_USERNAMES[clean]} for this project.` };
      if (!SAMPLE_KNOWN_USERS[clean]) return { ok: false, username: clean, reason: "No CodeRise learner has this username." };
      return { ok: true, username: clean, name: SAMPLE_KNOWN_USERS[clean] };
    },
    sample,
  );
}

export function createTeam(collaborationId, payload, { sample } = {}) {
  return mutate(
    () => send("POST", `/community/collaborations/${enc(collaborationId)}/teams`, payload),
    () => {
      const data = sampleStore();
      const collaboration = sampleDetails(collaborationId);
      if (data.viewerLeads[collaborationId]) throw httpError("You already lead a team for this project.", 409);
      if (payload.size < collaboration.minMembers || payload.size > collaboration.maxMembers) {
        throw httpError(`Teams for this project have ${collaboration.minMembers}–${collaboration.maxMembers} members.`, 409);
      }
      if (1 + payload.invites.length > payload.size) throw httpError("This team would go over its member limit. Remove an invite or choose a bigger size.", 409);
      const roleName = (roleId) => collaboration.roles.find((role) => role.id === roleId)?.name ?? roleId;
      const id = nextId("team");
      data.teams[id] = buildNewTeam({
        id,
        name: payload.name,
        pitch: payload.pitch,
        collaboration,
        size: payload.size,
        roleName: roleName(payload.roleId),
        invites: payload.invites.map((invite) => ({ username: invite.username, roleName: roleName(invite.roleId) })),
        openRoleNames: payload.openRoleIds.map(roleName),
        visibility: payload.visibility,
      });
      data.viewerLeads[collaborationId] = id;
      collaboration.teams.push({
        id, name: payload.name, leaderName: SAMPLE_VIEWER.name, memberInitials: ["A"], maxMembers: payload.size,
        openRoles: payload.visibility === "open" ? payload.openRoleIds.filter((roleId) => !payload.invites.some((invite) => invite.roleId === roleId)) : [],
        status: "forming",
      });
      return { team: { id } };
    },
    sample,
  );
}

// ---------- Workspace ----------

export function getTeamWorkspace({ teamId }) {
  return read(
    `/community/teams/${enc(teamId)}`,
    (result) => Boolean(result?.team),
    () => {
      const team = sampleStore().teams[teamId];
      if (team) return { team: teamSummary(team) };
      // A team the sample viewer is not in: the backend would answer 403.
      for (const id of SAMPLE_COMMUNITY_COLLABORATIONS.map((item) => item.id)) {
        const other = sampleDetails(id).teams.find((item) => item.id === teamId);
        if (other) {
          return { team: { id: other.id, name: other.name, collaboration: { id, title: sampleDetails(id).title }, viewerIsMember: false, viewerIsLeader: false } };
        }
      }
      throw new Error("This team could not be found.");
    },
    "This team workspace is not available yet.",
  );
}

export function getTeamOverview({ teamId }) {
  return read(
    `/community/teams/${enc(teamId)}/overview`,
    (result) => Array.isArray(result?.dueThisWeek),
    () => {
      const team = sampleTeam(teamId);
      const weekAhead = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      const order = { in_progress: 0, todo: 1 };
      return {
        dueThisWeek: clone(team.tasks.filter((item) => item.status !== "done" && item.dueDate <= weekAhead)
          .sort((a, b) => order[a.status] - order[b.status] || a.dueDate.localeCompare(b.dueDate)).slice(0, 4)),
        recentFiles: clone([...team.files].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3)),
        recentMessages: clone(team.messages.filter((item) => item.channel === "general" && item.type === "message").slice(-3)),
        joinRequests: viewerIsLeader(team) ? clone(team.joinRequests) : [],
        confirmations: team.members.map((member) => ({ username: member.username, name: member.name, confirmedAt: team.confirmations[member.username] ?? null })),
      };
    },
    "The team overview is not available yet.",
  );
}

export function decideJoinRequest(teamId, requestId, decision, { sample } = {}) {
  return mutate(
    () => send("POST", `/community/teams/${enc(teamId)}/join-requests/${enc(requestId)}`, { decision }),
    () => {
      const team = sampleTeam(teamId);
      requireLeader(team);
      const request = team.joinRequests.find((item) => item.id === requestId);
      if (!request) throw httpError("This request has already been handled.", 409);
      if (decision === "accept") {
        if (team.members.length >= team.maxMembers) throw httpError(`${team.name} is full (${team.members.length} of ${team.maxMembers}). Accepting would go over the limit.`, 409);
        team.members.push({ username: request.username, name: request.name, role: request.roleName, isLeader: false, online: false, lastSeenAt: new Date().toISOString() });
        team.confirmations[request.username] = null;
      }
      team.joinRequests = team.joinRequests.filter((item) => item.id !== requestId);
      return {};
    },
    sample,
  );
}

export function updateMemberRoles(teamId, roles, { sample } = {}) {
  return mutate(
    () => send("PUT", `/community/teams/${enc(teamId)}/roles`, { roles }),
    () => {
      const team = sampleTeam(teamId);
      requireLeader(team);
      team.members.forEach((member) => { if (roles[member.username]) member.role = roles[member.username]; });
      return {};
    },
    sample,
  );
}

// ---------- S10 Tasks ----------

export function getTeamTasks({ teamId }) {
  return read(
    `/community/teams/${enc(teamId)}/tasks`,
    (result) => Array.isArray(result?.tasks),
    () => ({ tasks: clone(sampleTeam(teamId).tasks) }),
    "The task board is not available yet.",
  );
}

function labelFor(team, username) {
  const role = team.members.find((member) => member.username === username)?.role ?? "";
  if (/design/i.test(role)) return "UI Design";
  if (/front/i.test(role)) return "Frontend";
  if (/back/i.test(role)) return "Backend";
  return role || "General";
}

export function createTask(teamId, values, { sample } = {}) {
  return mutate(
    () => send("POST", `/community/teams/${enc(teamId)}/tasks`, values),
    () => {
      const team = sampleTeam(teamId);
      const now = new Date().toISOString();
      const created = { id: nextId("task"), ...values, label: labelFor(team, values.assignee), createdBy: SAMPLE_VIEWER.username, createdAt: now, updatedAt: now };
      team.tasks.push(created);
      return { task: clone(created) };
    },
    sample,
  );
}

export function updateTask(teamId, taskId, changes, { sample } = {}) {
  return mutate(
    () => send("PATCH", `/community/teams/${enc(teamId)}/tasks/${enc(taskId)}`, changes),
    () => {
      const team = sampleTeam(teamId);
      const item = team.tasks.find((entry) => entry.id === taskId);
      if (!item) throw httpError("This task no longer exists.", 404);
      const becameDone = changes.status === "done" && item.status !== "done";
      Object.assign(item, changes, { updatedAt: new Date().toISOString() });
      if (changes.assignee) item.label = labelFor(team, changes.assignee);
      if (becameDone) {
        const who = team.members.find((member) => member.username === item.assignee)?.name.split(" ")[0] ?? "Someone";
        team.messages.push({ id: nextId("m"), channel: "general", type: "event", author: null, body: `${who} completed “${item.title}”`, event: { kind: "task_done", taskId, title: "Task moved to Done" }, createdAt: new Date().toISOString(), pinned: false, attachment: null });
      }
      return { task: clone(item) };
    },
    sample,
  );
}

export function deleteTask(teamId, taskId, { sample } = {}) {
  return mutate(
    () => send("DELETE", `/community/teams/${enc(teamId)}/tasks/${enc(taskId)}`),
    () => {
      const team = sampleTeam(teamId);
      team.tasks = team.tasks.filter((entry) => entry.id !== taskId);
      return {};
    },
    sample,
  );
}

// ---------- S09b Chat ----------

export function getTeamChat({ teamId, channel = "general" }) {
  return read(
    `/community/teams/${enc(teamId)}/chat${queryString({ channel })}`,
    (result) => Array.isArray(result?.messages),
    () => {
      const team = sampleTeam(teamId);
      const current = team.channels.find((item) => item.id === channel) ?? team.channels[0];
      const result = {
        channels: clone(team.channels),
        channel: current.id,
        messages: clone(team.messages.filter((item) => item.channel === current.id)),
        pinned: clone(team.messages.filter((item) => item.pinned)),
      };
      current.unread = 0; // opening a channel marks it read
      return result;
    },
    "Team chat is not available yet.",
  );
}

export function sendTeamMessage(teamId, { channel, body, mentions, attachment }, { sample } = {}) {
  return mutate(
    () => send("POST", `/community/teams/${enc(teamId)}/messages`, { channel, body, mentions, attachment }),
    () => {
      const team = sampleTeam(teamId);
      const created = { id: nextId("m"), channel, type: "message", author: { ...SAMPLE_VIEWER }, body, mentions, attachment, pinned: false, createdAt: new Date().toISOString() };
      team.messages.push(created);
      return { message: clone(created) };
    },
    sample,
  );
}

export function setMessagePinned(teamId, messageId, pinned, { sample } = {}) {
  return mutate(
    () => send(pinned ? "POST" : "DELETE", `/community/teams/${enc(teamId)}/messages/${enc(messageId)}/pin`),
    () => {
      const item = sampleTeam(teamId).messages.find((entry) => entry.id === messageId);
      if (item) item.pinned = pinned;
      return {};
    },
    sample,
  );
}

// Chat attachments and Files uploads share the 25 MB limit (checked again by the backend).
export function uploadTeamAttachment(file, { sample } = {}) {
  if (file.size > TEAM_FILE_LIMIT_BYTES) return Promise.reject(httpError(`${file.name} is too big. Files must be 25 MB or smaller.`, 413));
  return mutate(
    async () => {
      const uploaded = await uploadFile(file, "attachment");
      return { name: file.name, url: uploaded.url, size: file.size, kind: kindFromName(file.name) };
    },
    () => ({ name: file.name, url: URL.createObjectURL(file), size: file.size, kind: kindFromName(file.name), local: true }),
    sample,
  );
}

// ---------- S09c Files ----------

export function kindFromName(name = "") {
  const ext = name.split(".").pop().toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["zip", "rar", "7z"].includes(ext)) return "zip";
  if (ext === "fig") return "figma";
  return "doc";
}

export function kindFromUrl(url = "") {
  if (/github\.com/i.test(url)) return "github";
  if (/figma\.com/i.test(url)) return "figma";
  if (/drive\.google\.com|docs\.google\.com/i.test(url)) return "drive";
  if (/youtube\.com|youtu\.be|vimeo\.com/i.test(url)) return "video";
  return "link";
}

export function getTeamFiles({ teamId, folder = "" }) {
  return read(
    `/community/teams/${enc(teamId)}/files${queryString({ folder })}`,
    (result) => Array.isArray(result?.files),
    () => {
      const team = sampleTeam(teamId);
      const leader = viewerIsLeader(team);
      const sorted = [...team.files].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      return {
        files: clone(sorted.filter((item) => !folder || item.folderId === folder))
          .map((item) => ({ ...item, viewerCanDelete: !item.readOnly && (leader || item.addedBy.username === SAMPLE_VIEWER.username) })),
        folders: team.folders.map((item) => ({ ...item, count: team.files.filter((entry) => entry.folderId === item.id).length })),
        total: team.files.length,
        storage: { usedBytes: team.otherStorageBytes + team.files.reduce((sum, item) => sum + (item.size ?? 0), 0), limitBytes: team.storageLimitBytes },
        activity: sorted.slice(0, 4).map((item) => ({
          id: item.id,
          text: `${item.addedBy.name.split(" ")[0]} ${item.type === "link" ? (item.kind === "github" ? "linked the GitHub repository" : `linked ${item.name}`) : `uploaded ${item.name}`}`,
          at: item.updatedAt,
        })),
      };
    },
    "Shared files are not available yet.",
  );
}

export function uploadTeamFile(teamId, file, { folderId }, { sample } = {}) {
  if (file.size > TEAM_FILE_LIMIT_BYTES) return Promise.reject(httpError(`${file.name} is ${formatMb(file.size)}. Files must be 25 MB or smaller.`, 413));
  return mutate(
    async () => {
      const uploaded = await uploadFile(file, "attachment");
      return send("POST", `/community/teams/${enc(teamId)}/files`, { name: file.name, url: uploaded.url, size: file.size, folderId });
    },
    () => {
      const team = sampleTeam(teamId);
      const created = { id: nextId("f"), name: file.name, type: "file", kind: kindFromName(file.name), note: "Uploaded", folderId: folderId || team.folders[0].id, addedBy: { ...SAMPLE_VIEWER }, updatedAt: new Date().toISOString(), size: file.size, url: URL.createObjectURL(file), readOnly: false };
      team.files.push(created);
      return { file: created };
    },
    sample,
  );
}

const formatMb = (bytes) => `${Math.round(bytes / (1024 * 1024))} MB`;

export function addTeamLink(teamId, { name, url, folderId }, { sample } = {}) {
  return mutate(
    () => send("POST", `/community/teams/${enc(teamId)}/links`, { name, url, folderId }),
    () => {
      const team = sampleTeam(teamId);
      const kind = kindFromUrl(url);
      const notes = { github: "Repository link", figma: "Figma link", drive: "Google Drive link", video: "Video link", link: "Link" };
      const created = { id: nextId("f"), name, type: "link", kind, note: notes[kind], folderId: folderId || team.folders[0].id, addedBy: { ...SAMPLE_VIEWER }, updatedAt: new Date().toISOString(), size: null, url, readOnly: false };
      team.files.push(created);
      return { file: created };
    },
    sample,
  );
}

export function createTeamFolder(teamId, { name }, { sample } = {}) {
  return mutate(
    () => send("POST", `/community/teams/${enc(teamId)}/folders`, { name }),
    () => {
      const team = sampleTeam(teamId);
      if (team.folders.some((item) => item.name.toLowerCase() === name.toLowerCase())) throw httpError("A folder with this name already exists.", 409);
      const folder = { id: nextId("folder"), name };
      team.folders.push(folder);
      return { folder };
    },
    sample,
  );
}

export function deleteTeamFile(teamId, fileId, { sample } = {}) {
  return mutate(
    () => send("DELETE", `/community/teams/${enc(teamId)}/files/${enc(fileId)}`),
    () => {
      const team = sampleTeam(teamId);
      team.files = team.files.filter((item) => item.id !== fileId);
      return {};
    },
    sample,
  );
}

// ---------- S09d Submission ----------

export function getTeamSubmission({ teamId }) {
  return read(
    `/community/teams/${enc(teamId)}/submission`,
    (result) => Boolean(result?.submission),
    () => {
      const team = sampleTeam(teamId);
      return {
        submission: clone(team.submission),
        contributions: contributions(team),
        confirmations: team.members.map((member) => ({ username: member.username, name: member.name, confirmedAt: team.confirmations[member.username] ?? null })),
        openTasks: team.tasks.filter((item) => item.status !== "done").length,
        deadline: team.deadline,
      };
    },
    "The submission is not available yet.",
  );
}

export function saveSubmissionDraft(teamId, { links, notes }, { sample } = {}) {
  return mutate(
    () => send("PUT", `/community/teams/${enc(teamId)}/submission`, { links, notes }),
    () => {
      const team = sampleTeam(teamId);
      requireLeader(team);
      if (team.submission.status === "submitted") throw httpError("This team has already submitted.", 409);
      Object.assign(team.submission, { links: { ...links }, notes, updatedAt: new Date().toISOString() });
      return {};
    },
    sample,
  );
}

export function confirmSubmission(teamId, { sample } = {}) {
  return mutate(
    () => send("POST", `/community/teams/${enc(teamId)}/submission/confirm`),
    () => { sampleTeam(teamId).confirmations[SAMPLE_VIEWER.username] = new Date().toISOString(); return {}; },
    sample,
  );
}

export function remindMember(teamId, username, { sample } = {}) {
  return mutate(
    () => send("POST", `/community/teams/${enc(teamId)}/submission/remind`, { username }),
    () => { requireLeader(sampleTeam(teamId)); return {}; },
    sample,
  );
}

export function submitTeamProject(teamId, { links, notes, agreed }, { sample } = {}) {
  return mutate(
    () => send("POST", `/community/teams/${enc(teamId)}/submission/submit`, { links, notes, agreed }),
    () => {
      const team = sampleTeam(teamId);
      requireLeader(team);
      if (team.submission.status === "submitted") throw httpError("This team has already submitted. Each team submits once.", 409);
      if (Date.now() > new Date(team.deadline).getTime()) throw httpError("The submission deadline has passed.", 409);
      if (team.members.some((member) => !team.confirmations[member.username])) throw httpError("Every member must confirm their part before the leader submits.", 409);
      const now = new Date().toISOString();
      Object.assign(team.submission, { links: { ...links }, notes, status: "submitted", submittedAt: now, updatedAt: now });
      return {};
    },
    sample,
  );
}
