import { Award, Code2, Flag, Heart, Rocket, Star, TrendingUp, Trophy, Users, Zap } from "lucide-react";

// Icon, colour and trigger choices for A24 Badges. The backend evaluates the triggers; the admin
// only picks which verified event counts and how many times.

export const BADGE_ICONS = { rocket: Rocket, star: Star, users: Users, zap: Zap, trophy: Trophy, trending: TrendingUp, heart: Heart, award: Award, flag: Flag, code: Code2 };
export const BADGE_ICON_LABELS = { rocket: "Rocket", star: "Star", users: "People", zap: "Lightning", trophy: "Trophy", trending: "Rising chart", heart: "Heart", award: "Medal", flag: "Flag", code: "Code" };
export const BADGE_COLOURS = [
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "teal", label: "Teal" },
  { value: "amber", label: "Amber" },
  { value: "orange", label: "Orange" },
  { value: "purple", label: "Purple" },
  { value: "pink", label: "Pink" },
  { value: "sky", label: "Sky" },
];
export const BADGE_TRIGGERS = [
  { value: "individual_project_approved", label: "Individual project approved", rule: (n) => (n === 1 ? "first individual project approved." : `${n} individual projects approved.`) },
  { value: "projects_approved_score80", label: "Project approved with score 80+", rule: (n) => `${n} projects approved with an average score of 80 or higher.` },
  { value: "collaboration_completed", label: "Collaboration project completed", rule: (n) => `${n} collaboration ${n === 1 ? "project" : "projects"} completed.` },
  { value: "hackathon_first_place", label: "Hackathon first place", rule: (n) => (n === 1 ? "first place in a hackathon (published results only)." : `first place in ${n} hackathons (published results only).`) },
  { value: "competition_podium", label: "Competition top three", rule: (n) => (n === 1 ? "first, second or third place in a competition." : `top three in ${n} competitions.`) },
  { value: "points_first_30_days", label: "Points in first 30 days", rule: (n) => `${n} points earned within 30 days of joining.` },
  { value: "helpful_answers", label: "Answer marked helpful", rule: (n) => `${n} helpful ${n === 1 ? "answer" : "answers"} marked by other students.` },
  { value: "manual_only", label: "Manual award only", rule: () => "awarded manually by an admin." },
];

export function badgeRule(badge) {
  const trigger = BADGE_TRIGGERS.find((item) => item.value === badge.trigger);
  return `Rule: ${trigger ? trigger.rule(Number(badge.count) || 1) : "custom rule."}`;
}
