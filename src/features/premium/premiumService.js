import { queryString } from "../../services/api/api";
import { requestData } from "../../services/api/dataClient";
import {
  PLAN_COMPARISON,
  PLAN_FAQS,
  SAMPLE_CANCELLATION_IMPACT,
  SAMPLE_PLANS,
  initialSampleAccount,
} from "./samplePremium";

// CodeRise Premium: S26 Plans (/premium), S27 Checkout (/premium/checkout), S28 Subscription
// (/account/subscription). All prices are in USD.
//
// Endpoints (student session required):
//   GET  /premium/plans
//        -> { plans: [plan], comparison?: [row], faqs?: [faq], viewer: { plan, cycle, status } }
//   GET  /premium/checkout/quote?plan=premium|plus&cycle=monthly|yearly
//        -> { quote: { plan, planName, cycle, prices: { monthly, yearly }, priceUsd,
//                      monthlyEquivalentUsd, discountUsd, taxUsd, totalUsd, renewsAt, benefits: [string] },
//             viewer: { plan, cycle, status, email } }
//   POST /premium/checkout-sessions { plan, cycle, returnPath }
//        -> { authorizationUrl, reference }
//        The page sends the student to authorizationUrl (the payment provider's hosted page). Card
//        details are entered ONLY there — CodeRise never collects or stores card numbers. The
//        provider sends the student back to returnPath with ?reference=… appended.
//   GET  /premium/checkout-sessions/:reference
//        -> { status: "pending" | "active" | "failed", subscription?, failureReason? }
//        "active" must only be returned once the backend has verified the payment itself (the
//        provider's webhook / server-side verification). The page polls while "pending" and never
//        unlocks anything on its own.
//   GET  /account/subscription
//        -> { subscription, invoices: [invoice], cancellationImpact: { premiumProjects,
//             inProgressProjects: [title], premiumTeams: [name] } }
//        paymentMethod is a masked summary ({ brand, last4 }) — never a full card number.
//   POST /account/subscription/change { plan, cycle }
//        -> { subscription }  (upgrades charge the prorated difference straight away; downgrades
//           and cycle switches are scheduled for the end of the paid period: pendingChange)
//        or { authorizationUrl } when the provider needs the student to confirm the charge.
//   POST /account/subscription/cancel { reason } -> { subscription } (status "cancelling";
//        access continues until renewsAt)
//   POST /account/subscription/resume            -> { subscription }
//   POST /account/subscription/payment-method    -> { authorizationUrl } (provider-hosted page)
//
// Premium access (viewerHasPremium etc.) is decided and enforced by the backend everywhere; these
// screens only display what the API returns.
//
// On the local dev server, when the API is missing, reads fall back to sample data and writes go
// to an in-memory sample account so the flow can be tried. Sample checkout never contacts a payment
// provider and takes no money; the pages say so. Production builds always show the real error.

export const PLAN_IDS = ["free", "premium", "plus"];
export const PAID_PLAN_IDS = ["premium", "plus"];
export const CYCLES = ["monthly", "yearly"];
const PLAN_RANK = { free: 0, premium: 1, plus: 2 };

export const planRank = (plan) => PLAN_RANK[plan] ?? 0;

// ---------- reads ----------

export async function getPremiumPlans() {
  try {
    const result = await requestData("/premium/plans");
    if (!Array.isArray(result?.plans)) throw new Error("Premium plans are not available right now.");
    return {
      plans: result.plans,
      comparison: result.comparison ?? PLAN_COMPARISON,
      faqs: result.faqs ?? PLAN_FAQS,
      viewer: result.viewer ?? { plan: "free", cycle: null, status: "free" },
      isSample: false,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      const { subscription } = sampleAccount();
      return {
        plans: SAMPLE_PLANS,
        comparison: PLAN_COMPARISON,
        faqs: PLAN_FAQS,
        viewer: { plan: subscription.plan, cycle: subscription.cycle, status: subscription.status },
        isSample: true,
      };
    }
    throw error;
  }
}

export async function getCheckoutQuote({ plan, cycle }) {
  try {
    const result = await requestData(`/premium/checkout/quote${queryString({ plan, cycle })}`);
    if (!result?.quote) throw new Error("This plan can't be checked out right now.");
    return { ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) {
      const { subscription } = sampleAccount();
      return {
        quote: sampleQuote(plan, cycle),
        viewer: { plan: subscription.plan, cycle: subscription.cycle, status: subscription.status, email: null },
        isSample: true,
      };
    }
    throw error;
  }
}

export async function getCheckoutStatus({ reference }) {
  if (isSampleReference(reference)) return delay(activateSampleCheckout(reference));
  const result = await requestData(`/premium/checkout-sessions/${encodeURIComponent(reference)}`);
  if (!result?.status) throw new Error("We couldn't check your payment yet.");
  return { ...result, isSample: false };
}

export async function getSubscription() {
  try {
    const result = await requestData("/account/subscription");
    if (!result?.subscription) throw new Error("Your subscription details are not available right now.");
    return { invoices: [], cancellationImpact: null, ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) {
      const account = sampleAccount();
      return {
        subscription: { ...account.subscription },
        invoices: [...account.invoices],
        cancellationImpact: SAMPLE_CANCELLATION_IMPACT,
        isSample: true,
      };
    }
    throw error;
  }
}

// S28 needs the subscription and the plan list (for "Change plan").
export async function getSubscriptionPage() {
  const [subscription, plans] = await Promise.all([getSubscription(), getPremiumPlans()]);
  return { ...subscription, plans: plans.plans, isSample: subscription.isSample || plans.isSample };
}

// ---------- writes ----------

const send = (method, path, body) => requestData(path, undefined, { method, body: body === undefined ? undefined : JSON.stringify(body) });
const delay = (value) => new Promise((resolve) => { window.setTimeout(() => resolve(value), 400); });

// Same pattern as the admin project service: on the dev server a missing API falls back to the
// sample account; real validation / payment errors are always shown.
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

export function startCheckout({ plan, cycle, returnPath }, { sample } = {}) {
  return mutate(
    () => send("POST", "/premium/checkout-sessions", { plan, cycle, returnPath }),
    () => ({ reference: `sample-${plan}-${cycle}-${Date.now()}`, sample: true }),
    sample,
  );
}

export function changePlan({ plan, cycle }, { sample } = {}) {
  return mutate(() => send("POST", "/account/subscription/change", { plan, cycle }), () => sampleChangePlan(plan, cycle), sample);
}

export function cancelSubscription({ reason }, { sample } = {}) {
  return mutate(() => send("POST", "/account/subscription/cancel", { reason }), () => sampleCancel(), sample);
}

export function resumeSubscription({ sample } = {}) {
  return mutate(() => send("POST", "/account/subscription/resume", {}), () => sampleResume(), sample);
}

export function updatePaymentMethod({ sample } = {}) {
  return mutate(() => send("POST", "/account/subscription/payment-method", {}), () => ({ sample: true }), sample);
}

// ---------- shared helpers ----------

export function normaliseCheckoutParams(params) {
  const plan = PAID_PLAN_IDS.includes(params.get("plan")) ? params.get("plan") : "premium";
  const cycle = CYCLES.includes(params.get("cycle")) ? params.get("cycle") : "monthly";
  return { plan, cycle };
}

export function isSampleReference(reference) {
  return typeof reference === "string" && reference.startsWith("sample-");
}

// ---------- sample account (dev server only) ----------

let account = null;
const sampleAccount = () => {
  if (!account) account = initialSampleAccount();
  return account;
};

const round = (value) => Math.round(value * 100) / 100;
const planById = (id) => SAMPLE_PLANS.find((item) => item.id === id) ?? SAMPLE_PLANS[1];
const priceFor = (plan, cycle) => (cycle === "yearly" ? planById(plan).yearlyUsd : planById(plan).monthlyUsd);

function addPeriod(from, cycle) {
  const date = new Date(from);
  if (cycle === "yearly") date.setFullYear(date.getFullYear() + 1);
  else date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

function sampleQuote(planId, cycle) {
  const plan = planById(planId);
  const price = priceFor(plan.id, cycle);
  return {
    plan: plan.id,
    planName: plan.name,
    cycle,
    prices: { monthly: plan.monthlyUsd, yearly: plan.yearlyUsd },
    priceUsd: price,
    monthlyEquivalentUsd: cycle === "yearly" ? round(plan.yearlyUsd / 12) : plan.monthlyUsd,
    discountUsd: cycle === "yearly" ? round(plan.monthlyUsd * 12 - plan.yearlyUsd) : 0,
    taxUsd: 0,
    totalUsd: price,
    renewsAt: addPeriod(Date.now(), cycle),
    benefits: plan.benefits,
  };
}

const activated = new Set();
function activateSampleCheckout(reference) {
  const [, plan, cycle] = reference.split("-");
  const current = sampleAccount();
  if (!activated.has(reference) && PAID_PLAN_IDS.includes(plan) && CYCLES.includes(cycle)) {
    activated.add(reference);
    const now = new Date().toISOString();
    const price = priceFor(plan, cycle);
    current.subscription = {
      plan,
      cycle,
      status: "active",
      priceUsd: price,
      startedAt: now,
      renewsAt: addPeriod(now, cycle),
      pendingChange: null,
      paymentMethod: { brand: "Visa", last4: "4417" },
    };
    current.invoices = [
      { id: `inv-${reference}`, date: now, description: `CodeRise ${planById(plan).name} · ${cycle === "yearly" ? "Yearly" : "Monthly"}`, amountUsd: price, status: "paid", receiptNumber: `CR-INV-SAMPLE-${current.invoices.length + 1}`, receiptUrl: null },
      ...current.invoices,
    ];
  }
  return { status: "active", subscription: { ...current.subscription }, isSample: true };
}

function sampleChangePlan(plan, cycle) {
  const current = sampleAccount();
  const sub = current.subscription;
  if (plan === "free") return sampleCancel();
  if (sub.plan === "free") throw new Error("Choose a plan from the Premium page to subscribe.");
  const nextCycle = cycle ?? sub.cycle;
  if (planRank(plan) > planRank(sub.plan)) {
    // Upgrade now: charge the unused share of the price difference.
    const total = new Date(sub.renewsAt) - new Date(sub.startedAt);
    const left = Math.max(0, new Date(sub.renewsAt) - Date.now());
    const charge = round((priceFor(plan, sub.cycle) - sub.priceUsd) * (total ? left / total : 1));
    current.subscription = { ...sub, plan, status: "active", priceUsd: priceFor(plan, sub.cycle), pendingChange: null };
    current.invoices = [
      { id: `inv-upgrade-${Date.now()}`, date: new Date().toISOString(), description: `Upgrade to ${planById(plan).name} · prorated`, amountUsd: charge, status: "paid", receiptNumber: `CR-INV-SAMPLE-${current.invoices.length + 1}`, receiptUrl: null },
      ...current.invoices,
    ];
  } else {
    current.subscription = { ...sub, status: "active", pendingChange: { plan, cycle: nextCycle, effectiveAt: sub.renewsAt } };
  }
  return { subscription: { ...current.subscription } };
}

function sampleCancel() {
  const current = sampleAccount();
  const sub = current.subscription;
  if (sub.plan === "free") throw new Error("You don't have a paid subscription to cancel.");
  current.subscription = { ...sub, status: "cancelling", pendingChange: { plan: "free", cycle: null, effectiveAt: sub.renewsAt } };
  return { subscription: { ...current.subscription } };
}

function sampleResume() {
  const current = sampleAccount();
  current.subscription = { ...current.subscription, status: "active", pendingChange: null };
  return { subscription: { ...current.subscription } };
}
