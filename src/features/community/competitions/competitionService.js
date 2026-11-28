import { queryString } from "../../../services/api/api";
import { requestData } from "../../../services/api/dataClient";
import { SAMPLE_VIEWER_PROFILE, sampleCompetitionDetails, sampleCompetitionResults } from "./sampleCompetitionDetails";

// Data access for the competition screens: S16 Details, S17 Registration, S18 Payment and
// S19 Results. Like communityService.js, a failed read on the local dev server (`npm run dev`)
// falls back to sample data and the page shows a notice; production shows the error.
//
// The backend owns every rule the UI only reflects: whether registration is open, places left,
// whether the viewer is registered, the entry fee, and payment status. The page never decides
// any of these from the browser clock or its own maths.
//
// ---- Endpoints ----
// GET  /community/competitions/:id
//   -> { competition: { id, number, title, category, summary, description, format, prize,
//        entryFeeUsd (0 = free), processingFeeUsd, status: "open"|"closing_soon"|"closed"|"results",
//        registrationOpensAt, registrationClosesAt, submissionDeadline, judgingStartsAt, judgingEndsAt,
//        winnersAnnouncedAt (ISO), participants, capacity,
//        rules: [string], criteria: [{ label, weight }], requirements: [{ icon, title, detail, required }],
//        checklist: [{ label, hint }], prizes: [{ place: 1|2|3|"mention", title, reward }],
//        viewerRegistered, viewerRegistration: { status: "confirmed", receiptNumber } | null,
//        viewer: { fullName, email, displayName, country } } }
//
// POST /community/competitions/:id/registrations { acceptedRules: true, confirmations: [index…] }
//   Free competitions only -> { registration: { status: "confirmed" } }.
//   The backend rejects it (422) for paid competitions, closed registration or full capacity.
//
// POST /community/competitions/:id/payments { acceptedRules: true, confirmations: [index…],
//        returnUrl: "<origin>/community/competitions/:id/checkout" }
//   -> { authorizationUrl, reference }. The page redirects to authorizationUrl (the payment
//   provider's hosted checkout, where the card is entered). The provider sends the student back
//   to returnUrl?reference=…; card details never touch CodeRise. No registration exists yet.
//
// GET  /community/competitions/:id/payments/:reference
//   -> { payment: { status: "pending"|"successful"|"failed", amountUsd, receiptNumber, failureReason } }
//   The backend confirms the payment from the provider's webhook and only then creates the
//   registration; the page polls this while the status is "pending".
//
// GET  /community/competitions/:id/results?page=&pageSize=
//   -> { results: { competition: {...as above}, published: boolean, publishedAt, judgesCount,
//        entriesCount, podium: [entry ×3], mentions: [entry…], entries: [entry…this page],
//        pagination: { page, totalPages, total }, viewerEntry: entry | null,
//        viewerFeedback: [{ judge, score, comment }] | null } }
//   entry: { rank, name, username, track, city, project, projectUrl, submittedAt, score,
//            award: "place_1"|"place_2"|"place_3"|"mention"|null, prize, judgeComment, points, isViewer }

export const RESULTS_PAGE_SIZE = 10;

const delay = (value, ms = 400) => new Promise((resolve) => { window.setTimeout(() => resolve(value), ms); });
const send = (method, path, body) => requestData(path, undefined, { method, body: JSON.stringify(body ?? {}) });
const competitionPath = (id) => `/community/competitions/${encodeURIComponent(id)}`;

// Registrations made in sample mode, so the screens agree with each other until a reload.
const sampleRegistrations = new Map();
// Simulated payments: reference -> { status, outcome, receiptNumber }.
const samplePayments = new Map();

function withSampleRegistration(competition) {
  const local = sampleRegistrations.get(competition.id);
  const registered = Boolean(local) || competition.viewerRegistered;
  return {
    ...competition,
    participants: competition.participants + (local ? 1 : 0),
    viewerRegistered: registered,
    viewerRegistration: registered ? { status: "confirmed", receiptNumber: local?.receiptNumber ?? null } : null,
    viewer: SAMPLE_VIEWER_PROFILE,
  };
}

// Same rule as adminProjectsService: in DEV a missing API falls back to the sample.
async function mutate(real, sampleChange, sample) {
  if (sample) return delay(sampleChange());
  try {
    return await real();
  } catch (error) {
    const missing = !error.status || [404, 405, 501].includes(error.status) || error.status >= 500;
    if (import.meta.env.DEV && missing) return delay(sampleChange());
    throw error;
  }
}

export async function getCompetition({ id }) {
  try {
    const competition = await requestData(competitionPath(id), "competition");
    if (!competition) throw new Error("This competition is not available.");
    return { competition, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) {
      const competition = sampleCompetitionDetails(id);
      if (!competition) throw new Error("We couldn't find that competition. It may have been removed.", { cause: error });
      return { competition: withSampleRegistration(competition), isSample: true };
    }
    throw error;
  }
}

export function registerForCompetition(id, { confirmations }, { sample } = {}) {
  return mutate(
    () => send("POST", `${competitionPath(id)}/registrations`, { acceptedRules: true, confirmations }),
    () => {
      sampleRegistrations.set(id, { receiptNumber: null });
      return { registration: { status: "confirmed" }, isSample: true };
    },
    sample,
  );
}

// outcome ("successful" | "failed") is only used to simulate a result in sample mode.
export function startCompetitionPayment(id, { confirmations, outcome = "successful" }, { sample } = {}) {
  const returnUrl = `${window.location.origin}/community/competitions/${encodeURIComponent(id)}/checkout`;
  return mutate(
    () => send("POST", `${competitionPath(id)}/payments`, { acceptedRules: true, confirmations, returnUrl }),
    () => {
      const reference = `SAMPLE-${Date.now().toString(36).toUpperCase()}`;
      samplePayments.set(reference, { outcome, checks: 0 });
      return { reference, authorizationUrl: null, isSample: true };
    },
    sample,
  );
}

export async function getCompetitionPayment(id, reference) {
  const simulated = samplePayments.get(reference);
  if (simulated || reference.startsWith("SAMPLE-")) {
    if (!simulated) throw new Error("We couldn't find this payment. If you were charged, contact support with your reference.");
    simulated.checks += 1;
    // The first check stays "pending" so the processing state can be seen.
    if (simulated.checks < 2) return delay({ payment: { status: "pending" } }, 900);
    if (simulated.outcome === "failed") {
      return delay({ payment: { status: "failed", failureReason: "Your card was declined. You have not been charged and your registration is not confirmed yet." } });
    }
    const receiptNumber = `CR-PAY-${reference.slice(-5)}`;
    sampleRegistrations.set(id, { receiptNumber });
    const competition = sampleCompetitionDetails(id);
    return delay({ payment: { status: "successful", amountUsd: (competition?.entryFeeUsd ?? 0) + (competition?.processingFeeUsd ?? 0), receiptNumber } });
  }
  return requestData(`${competitionPath(id)}/payments/${encodeURIComponent(reference)}`);
}

export async function getCompetitionResults({ id, page = 1 }) {
  const params = { page, pageSize: RESULTS_PAGE_SIZE };
  try {
    const results = await requestData(`${competitionPath(id)}/results${queryString(params)}`, "results");
    if (!results) throw new Error("These results are not available.");
    return { results, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) {
      const sample = sampleCompetitionResults(id);
      if (!sample) throw new Error("We couldn't find that competition. It may have been removed.", { cause: error });
      return { results: pageSampleResults(sample, params), isSample: true };
    }
    throw error;
  }
}

function pageSampleResults(sample, { page, pageSize }) {
  if (!sample.published) return sample;
  const { entries, ...rest } = sample;
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  return {
    ...rest,
    podium: entries.slice(0, 3),
    mentions: entries.filter((entry) => entry.award === "mention"),
    entries: entries.slice((current - 1) * pageSize, current * pageSize),
    pagination: { page: current, totalPages, total: entries.length },
    viewerEntry: entries.find((entry) => entry.isViewer) ?? null,
  };
}

// ---- Competition entry (registered students only) ----
// GET /community/competitions/:id/entry -> { competition, entry, acceptingSubmissions, serverNow }
// PUT /community/competitions/:id/entry { title, description, links:[{type,url}], confirmed, final }
//      final false saves a draft; final true submits. Submitted entries can be updated until the deadline.
const sampleEntries = new Map();

export async function getCompetitionEntry({ id }) {
  try {
    const data = await requestData(`${competitionPath(id)}/entry`);
    return { ...data, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV && (!error.status || error.status === 404 || error.status >= 500)) {
      const competition = sampleCompetitionDetails(id);
      if (!competition) throw new Error("We couldn't find that competition. It may have been removed.", { cause: error });
      return {
        competition: { id: competition.id, title: competition.title, submissionDeadline: competition.submissionDeadline ?? competition.registrationClosesAt, submissionRequirements: "", resultsPublished: competition.status === "results" },
        entry: sampleEntries.get(id) ?? null,
        acceptingSubmissions: competition.status !== "results",
        serverNow: new Date().toISOString(),
        isSample: true,
      };
    }
    throw error;
  }
}

export function saveCompetitionEntry(id, fields, { sample } = {}) {
  return mutate(
    () => send("PUT", `${competitionPath(id)}/entry`, fields),
    () => {
      const previous = sampleEntries.get(id);
      const now = new Date().toISOString();
      const submitted = fields.final || previous?.status === "submitted";
      const entry = {
        id: "sample-entry", status: submitted ? "submitted" : "draft", title: fields.title, description: fields.description,
        links: fields.links, submittedAt: submitted ? previous?.submittedAt ?? now : null, updatedAt: now, rank: null, placement: null,
      };
      sampleEntries.set(id, entry);
      return { entry, isSample: true };
    },
    sample,
  );
}
