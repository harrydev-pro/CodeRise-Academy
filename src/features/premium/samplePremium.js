// Sample CodeRise Premium data, used only by the local dev server while the Premium API is not
// available (see premiumService.js). It mirrors the S26–S28 designs and documents the shapes
// the backend is expected to return. All money is in USD.
//
// Plan fields:
//   id ("free" | "premium" | "plus"), name, tagline, badge (optional), monthlyUsd, yearlyUsd,
//   features: [string], benefits: [string] (what unlocks straight after paying; paid plans only).
//
// Subscription fields (GET /account/subscription -> { subscription, invoices, cancellationImpact }):
//   plan ("free" | "premium" | "plus"), cycle ("monthly" | "yearly" | null), status
//   ("free" | "active" | "cancelling" | "past_due"), priceUsd, startedAt, renewsAt (next billing
//   date, or the date paid access ends when cancelling), pendingChange ({ plan, cycle, effectiveAt } | null),
//   paymentMethod ({ brand, last4 } | null) — the backend only ever sends the brand and last 4 digits.
//
// Invoice fields: id, date, description, amountUsd, status ("paid" | "failed" | "complimentary" |
//   "refunded"), receiptNumber (null when none), receiptUrl (provider-hosted, optional), note (optional).

import { PREMIUM_FROM_PRICE } from "../community/sampleCommunityProjects";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (days) => new Date(Date.now() - days * DAY).toISOString();

// Keep in step with PREMIUM_FROM_PRICE ("$9.99/mo") used across the Community screens.
export const PREMIUM_MONTHLY_USD = 9.99;
export { PREMIUM_FROM_PRICE };

export const SAMPLE_PLANS = [
  {
    id: "free",
    name: "Free",
    tagline: "Everything you need to start learning and join the community.",
    monthlyUsd: 0,
    yearlyUsd: 0,
    features: [
      "Unlimited free learning",
      "Free projects and free collaboration",
      "Free hackathons and competitions",
      "Project showcase and leaderboard",
      "Limited project resources",
    ],
    benefits: [],
  },
  {
    id: "premium",
    name: "Premium",
    badge: "Most popular",
    tagline: "For students who want more practical learning opportunities.",
    monthlyUsd: PREMIUM_MONTHLY_USD,
    yearlyUsd: 99,
    features: [
      "Unlimited Premium project access",
      "Premium collaboration projects",
      "Advanced project resources",
      "Exclusive learning materials",
      "Eligible Premium community activities",
      "Exclusive masterclasses",
      "Premium community badge",
    ],
    benefits: ["38 Premium projects", "Premium team projects", "Masterclasses and advanced resources", "Premium badge on your profile"],
  },
  {
    id: "plus",
    name: "Premium Plus",
    badge: "For serious learners",
    tagline: "Everything in Premium, plus extra support and recognition.",
    monthlyUsd: 19.99,
    yearlyUsd: 199,
    features: [
      "Everything in Premium",
      "Priority project reviews",
      "Advanced practical challenges",
      "Expert-led workshops",
      "Priority access to selected team projects",
      "Portfolio feedback sessions",
      "Monthly career development sessions",
      "Priority mentorship access",
    ],
    benefits: ["Everything in Premium", "Priority project reviews", "Expert-led workshops", "Priority mentorship access"],
  },
];

// Feature comparison (S26). Values: true = "Yes", false = "No", or a short label.
export const PLAN_COMPARISON = [
  { feature: "Free learning", free: "Unlimited", premium: "Unlimited", plus: "Unlimited" },
  { feature: "Free projects", free: true, premium: true, plus: true },
  { feature: "Premium projects", free: false, premium: true, plus: true },
  { feature: "Free collaboration", free: true, premium: true, plus: true },
  { feature: "Premium collaboration", free: false, premium: true, plus: true },
  { feature: "Free hackathons", free: true, premium: true, plus: true },
  { feature: "Eligible Premium hackathons", free: false, premium: true, plus: true },
  { feature: "Free competitions", free: true, premium: true, plus: true },
  { feature: "Premium competition benefits", free: false, premium: "Selected", plus: "Selected" },
  { feature: "Project showcase", free: true, premium: true, plus: true },
  { feature: "Community leaderboard", free: true, premium: true, plus: true },
  { feature: "Advanced project resources", free: "Limited", premium: true, plus: true },
  { feature: "Priority project review", free: false, premium: false, plus: true },
  { feature: "Exclusive masterclasses", free: false, premium: true, plus: true },
  { feature: "Advanced learning resources", free: false, premium: true, plus: true },
  { feature: "Mentorship opportunities", free: false, premium: false, plus: "Priority access" },
];

export const PLAN_FAQS = [
  { question: "Can I cancel anytime?", answer: "Yes. You keep Premium until the end of the period you paid for, then move back to Free. Your projects and points stay on your profile." },
  { question: "Are competition entry fees included?", answer: "No. Paid competitions have their own entry fee unless the competition page says Premium members enter free." },
  { question: "I won a hackathon. How do I use my free month?", answer: "It is added to your account automatically when results are published. You will see it under Subscription with no payment needed." },
  { question: "Which payment methods do you accept?", answer: "International debit and credit cards in USD through our secure payment partner. You enter your card on their page, never on CodeRise." },
];

export const SAMPLE_CANCELLATION_IMPACT = {
  premiumProjects: 38,
  inProgressProjects: ["Mobile Banking App UI"],
  premiumTeams: ["Fintech Wallet"],
};

// The sample student starts on Free (as in the S26 and S27 designs). Finishing a sample checkout
// moves them to the paid plan, which shows the S28 Subscription design.
export function initialSampleAccount() {
  return {
    subscription: {
      plan: "free",
      cycle: null,
      status: "free",
      priceUsd: 0,
      startedAt: null,
      renewsAt: null,
      pendingChange: null,
      paymentMethod: null,
    },
    invoices: [
      { id: "inv-2611-comp", date: daysAgo(25), description: "Competition entry · Best Mobile Application", amountUsd: 5, status: "paid", receiptNumber: "CR-INV-2611-0418", receiptUrl: null },
      { id: "inv-2610-hack", date: daysAgo(107), description: "Hackathon reward · 1 month Premium", amountUsd: 0, status: "complimentary", receiptNumber: null, receiptUrl: null },
    ],
  };
}
