import { uploadFile } from "../../../services/api/api";
import { requestData } from "../../../services/api/dataClient";
import {
  buildSampleHackathon,
  buildSampleSubmission,
  buildSampleWorkspace,
  findSampleHackathon,
} from "./sampleHackathonDetails";

// Student hackathon screens: S12 Hackathon Details, S13 Hackathon Workspace, S14 Hackathon Submission.
//
// Endpoints (student session; field shapes are documented in sampleHackathonDetails.js):
//   GET    /community/hackathons/:id                 -> { hackathon }
//   POST   /community/hackathons/:id/registration    { mode: "team" | "match" | "individual", teamName?, agreedToRules: true }
//          -> { registration: { mode, teamName, isLeader } }
//   DELETE /community/hackathons/:id/registration    (withdraw, allowed until withdrawUntil)
//   GET    /community/hackathons/:id/workspace       -> { workspace }   403 unless registered and live
//   PATCH  /community/hackathons/:id/workspace/checklist/:itemId { done } -> { item }
//   GET    /community/hackathons/:id/submission      -> { submission, viewerIsLeader, teamName, teamSize }
//   PUT    /community/hackathons/:id/submission      { projectName, githubUrl, liveUrl, videoUrl, description,
//          screenshots: [{ name, url, size }], confirmed, final: boolean } -> { submission }
//   POST   /uploads (purpose "attachment")           screenshots, via uploadFile()
//
// Every response also carries `serverNow` (ISO). The pages use it to correct the browser clock so
// countdowns and the deadline follow server time. The BACKEND enforces every rule the UI shows:
// registration window, Premium access (viewerHasPremium), team size, "only the team leader can
// submit", workspace access for registered participants while live, and the submission deadline
// (late PUTs are rejected with 409/422 whatever the browser clock says).
//
// On the local dev server, when the API is missing, reads fall back to sample data (isSample: true)
// and writes go to an in-memory store, so every button can be tried. Changes last until reload.

const sampleState = new Map(); // id -> { hackathon, workspace, submission }

function sampleFor(id) {
  if (!sampleState.has(id)) {
    const item = findSampleHackathon(id);
    if (!item) return null;
    const hackathon = buildSampleHackathon(item);
    sampleState.set(id, { hackathon, workspace: buildSampleWorkspace(hackathon), submission: buildSampleSubmission() });
  }
  return sampleState.get(id);
}

function codedError(message, code, cause) {
  const error = new Error(message, cause ? { cause } : undefined);
  error.code = code;
  return error;
}

// Milliseconds to add to Date.now() to get server time.
const offsetFrom = (serverNow) => (serverNow ? new Date(serverNow).getTime() - Date.now() : 0);

export async function getHackathon({ id }) {
  try {
    const hackathon = await requestData(`/community/hackathons/${encodeURIComponent(id)}`, "hackathon");
    if (!hackathon) throw codedError("This hackathon could not be found.", "not_found");
    return { hackathon, clockOffset: offsetFrom(hackathon.serverNow), isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) {
      const state = sampleFor(id);
      if (!state) throw codedError("This hackathon could not be found.", "not_found", error);
      return { hackathon: structuredClone({ ...state.hackathon, serverNow: new Date().toISOString() }), clockOffset: 0, isSample: true };
    }
    throw error;
  }
}

export async function getHackathonWorkspace({ id }) {
  try {
    const workspace = await requestData(`/community/hackathons/${encodeURIComponent(id)}/workspace`, "workspace");
    if (!workspace) throw codedError("The workspace is not available.", "not_found");
    return { workspace, clockOffset: offsetFrom(workspace.serverNow), isSample: false };
  } catch (error) {
    if (error.status === 403) throw codedError(error.message || "The workspace is only open to registered participants while the hackathon is live.", "forbidden", error);
    if (import.meta.env.DEV) {
      const state = sampleFor(id);
      if (!state) throw codedError("This hackathon could not be found.", "not_found", error);
      if (!state.hackathon.viewerRegistration) throw codedError("You are not registered for this hackathon.", "not_registered", error);
      if (state.hackathon.status !== "live") throw codedError(state.hackathon.status === "past" ? "This hackathon has ended, so its workspace is closed." : "The workspace opens when the hackathon starts.", "not_live", error);
      const workspace = { ...state.workspace, hackathon: state.hackathon, submission: { status: state.submission.status, updatedAt: state.submission.updatedAt } };
      return { workspace: structuredClone(workspace), clockOffset: 0, isSample: true };
    }
    throw error;
  }
}

export async function getHackathonSubmission({ id }) {
  try {
    const result = await requestData(`/community/hackathons/${encodeURIComponent(id)}/submission`);
    if (!result?.submission || !result?.hackathon) throw codedError("The submission form is not available.", "not_found");
    return { ...result, clockOffset: offsetFrom(result.serverNow), isSample: false };
  } catch (error) {
    if (error.status === 403) throw codedError(error.message || "Only registered participants can submit.", "forbidden", error);
    if (import.meta.env.DEV) {
      const state = sampleFor(id);
      if (!state) throw codedError("This hackathon could not be found.", "not_found", error);
      if (!state.hackathon.viewerRegistration) throw codedError("You are not registered for this hackathon.", "not_registered", error);
      if (state.hackathon.status === "upcoming") throw codedError("Submissions open when the hackathon starts.", "not_live", error);
      return {
        hackathon: structuredClone(state.hackathon),
        submission: structuredClone(state.submission),
        viewerIsLeader: Boolean(state.hackathon.viewerRegistration.isLeader),
        teamName: state.hackathon.viewerRegistration.teamName,
        teamSize: state.workspace.team?.members.length ?? 1,
        clockOffset: 0,
        isSample: true,
      };
    }
    throw error;
  }
}

const send = (method, path, body) => requestData(path, undefined, { method, body: body === undefined ? undefined : JSON.stringify(body) });
const delay = (value) => new Promise((resolve) => { window.setTimeout(() => resolve(value), 350); });

// Runs a change against the API. On the local dev server, if the API isn't there (no response,
// not found, not signed in, or a server error), the change goes to the sample store instead.
// Real validation errors (400 / 409 / 422) are always shown.
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

export function registerForHackathon(id, { mode, teamName }, { sample } = {}) {
  return mutate(
    () => send("POST", `/community/hackathons/${encodeURIComponent(id)}/registration`, { mode, teamName: teamName || undefined, agreedToRules: true }),
    () => {
      const state = sampleFor(id);
      const registration = { mode, teamName: mode === "team" ? teamName : null, isLeader: mode !== "match" };
      state.hackathon = { ...state.hackathon, viewerRegistration: registration, viewerRegistered: true, registeredCount: state.hackathon.registeredCount + 1 };
      return { registration };
    },
    sample,
  );
}

export function withdrawFromHackathon(id, { sample } = {}) {
  return mutate(
    () => send("DELETE", `/community/hackathons/${encodeURIComponent(id)}/registration`),
    () => {
      const state = sampleFor(id);
      state.hackathon = { ...state.hackathon, viewerRegistration: null, viewerRegistered: false, registeredCount: state.hackathon.registeredCount - 1 };
      return {};
    },
    sample,
  );
}

export function setChecklistItem(id, itemId, done, { sample } = {}) {
  return mutate(
    () => send("PATCH", `/community/hackathons/${encodeURIComponent(id)}/workspace/checklist/${encodeURIComponent(itemId)}`, { done }),
    () => {
      const state = sampleFor(id);
      state.workspace = { ...state.workspace, checklist: state.workspace.checklist.map((item) => (item.id === itemId ? { ...item, done } : item)) };
      return { item: state.workspace.checklist.find((item) => item.id === itemId) };
    },
    sample,
  );
}

export function saveHackathonSubmission(id, fields, { final, sample, deadline } = {}) {
  return mutate(
    () => send("PUT", `/community/hackathons/${encodeURIComponent(id)}/submission`, { ...fields, final }),
    () => {
      // The real deadline check happens on the server; the sample imitates it.
      if (deadline && Date.now() >= new Date(deadline).getTime()) throw codedError("Submissions closed at the deadline.", "closed");
      const state = sampleFor(id);
      const now = new Date().toISOString();
      const wasSubmitted = state.submission.status === "submitted";
      state.submission = {
        ...state.submission,
        ...fields,
        status: final || wasSubmitted ? "submitted" : "draft",
        submittedAt: final ? now : state.submission.submittedAt,
        updatedAt: now,
      };
      return { submission: structuredClone(state.submission) };
    },
    sample,
  );
}

export function uploadScreenshot(file, { sample } = {}) {
  return mutate(
    async () => {
      const uploaded = await uploadFile(file, "attachment");
      return { url: uploaded.url, name: file.name, size: file.size };
    },
    () => ({ url: URL.createObjectURL(file), name: file.name, size: file.size, local: true }),
    sample,
  );
}
