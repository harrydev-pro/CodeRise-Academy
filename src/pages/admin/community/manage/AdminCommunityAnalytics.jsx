import {
  Activity, BarChart3, CheckCircle2, CircleCheck, ClipboardCheck, Crown, DollarSign, Download, PlayCircle, Trophy, Users, XCircle, Zap,
} from "lucide-react";

import Loader from "../../../../components/common/Loader";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import { BarList, LineChart } from "../../../../components/ui/Charts";
import { getCommunityAnalytics } from "../../../../features/community/admin/manage/adminManageService";
import { SampleNotice, StackedBars, StatCard } from "../../../../features/community/admin/manage/manageControls";
import { DAY, downloadCsv, isoDay, numberFormat, usd, useToastState } from "../../../../features/community/admin/manage/manageUtils";
import { useCommunityList, useUrlFilters } from "../../../../features/community/listHooks";

const PERIODS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
  { value: "custom", label: "Custom range" },
];
const signed = (value, suffix = "") => `${value >= 0 ? "+" : "−"}${Math.abs(value)}${suffix}`;
const signedUsd = (value) => `${value >= 0 ? "+" : "−"}${usd.format(Math.abs(value))}`;
const rangeFor = (days) => {
  const today = new Date();
  return { from: isoDay(new Date(today.getTime() - (Number(days) - 1) * DAY)), to: isoDay(today) };
};

export default function AdminCommunityAnalytics() {
  const { params, update } = useUrlFilters();
  const period = PERIODS.some((item) => item.value === params.get("period")) ? params.get("period") : "30";
  const preset = rangeFor(period === "custom" ? 30 : period);
  const today = isoDay(new Date());
  const range = period === "custom"
    ? { from: params.get("from") || preset.from, to: params.get("to") || preset.to }
    : preset;
  const { data, error, loading, refreshing, reload } = useCommunityList(getCommunityAnalytics, range);
  const [toast, setToast, closeToast] = useToastState();

  function setDate(name, value) {
    if (!value) return;
    update({ period: "custom", from: range.from, to: range.to, [name]: value });
  }

  function exportCsv() {
    if (!data) return;
    const { engagement: e, revenue: r } = data;
    const rows = [
      ["CodeRise Community analytics", `${range.from} to ${range.to}`],
      [],
      ["Metric", "Value"],
      ["Monthly active members", e.monthlyActiveMembers],
      ["Projects started", e.projectsStarted],
      ["Projects completed", e.projectsCompleted],
      ["Submission rate (%)", e.submissionRate],
      ["Team formations", e.teamsFormed],
      ["Collaboration completion (%)", e.collaborationCompletion],
      ["Hackathon registrations", e.hackathonRegistrations],
      ["Competition registrations", e.competitionRegistrations],
      ["Competition revenue (USD)", r.competitionRevenueUsd],
      ["Premium conversion (%)", r.premiumConversion],
      ["Monthly recurring revenue (USD)", r.mrrUsd],
      ["Subscription cancellations", r.cancellations],
      [],
      ["Premium funnel step", "People"],
      ...data.funnel.map((step) => [step.title, step.count]),
      [],
      ["Category", "Started", "Completed", "Completion rate (%)"],
      ...data.topCategories.map((row) => [row.category, row.started, row.completed, row.started ? Math.round((row.completed / row.started) * 100) : 0]),
      [],
      ["Month", "Subscriptions (USD)", "Competitions (USD)"],
      ...data.revenueBySource.map((row) => [row.label, row.subscriptions, row.competitions]),
    ];
    downloadCsv(`community-analytics-${range.from}-to-${range.to}.csv`, rows);
    setToast({ type: "success", message: "Analytics exported as CSV." });
  }

  return (
    <section className="admin-page community-admin cam-page">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMMUNITY MANAGEMENT</span>
          <h1>Community analytics</h1>
          <p>Engagement, conversion and revenue for the selected period. Revenue in USD.</p>
        </div>
      </header>

      <div className="cam-period" role="group" aria-label="Reporting period">
        <label className="cam-period-select">
          <span>Period</span>
          <select className="ui-input" value={period} onChange={(event) => update({ period: event.target.value === "30" ? "" : event.target.value, from: "", to: "" })}>
            {PERIODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">From</span>
          <input type="date" className="ui-input" value={range.from} max={range.to} onChange={(event) => setDate("from", event.target.value)} />
        </label>
        <label>
          <span className="sr-only">To</span>
          <input type="date" className="ui-input" value={range.to} min={range.from} max={today} onChange={(event) => setDate("to", event.target.value)} />
        </label>
        <button type="button" className="btn btn-primary" onClick={exportCsv} disabled={!data}><Download size={17} aria-hidden="true" /> Export CSV</button>
      </div>

      {loading && <Loader label="Loading analytics…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <div className={`community-admin-body${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing}>
          {data.isSample && <SampleNotice>Counts scale with the length of the period.</SampleNotice>}

          <section className="cam-section" aria-labelledby="engagement-title">
            <h2 id="engagement-title" className="cam-section-title">Engagement</h2>
            <Engagement e={data.engagement} />
          </section>

          <section className="cam-section" aria-labelledby="revenue-title">
            <h2 id="revenue-title" className="cam-section-title">Revenue & membership</h2>
            <div className="community-admin-stats cam-stats-4">
              <StatCard label="Competition revenue" value={usd.format(data.revenue.competitionRevenueUsd)} icon={DollarSign} tone="green" hint={signedUsd(data.revenue.competitionRevenueChangeUsd)} hintTone="good" />
              <StatCard label="Premium conversion" value={`${data.revenue.premiumConversion.toFixed(1)}%`} icon={Crown} tone="purple" hint={`${signed(data.revenue.premiumConversionChange)} pts`} hintTone={data.revenue.premiumConversionChange >= 0 ? "good" : "warn"} />
              <StatCard label="Monthly recurring revenue" value={usd.format(data.revenue.mrrUsd)} icon={BarChart3} tone="purple" hint={`${signedUsd(data.revenue.mrrChangeUsd)} vs ${data.revenue.mrrCompareLabel}`} hintTone={data.revenue.mrrChangeUsd >= 0 ? "good" : "warn"} />
              <StatCard label="Subscription cancellations" value={numberFormat.format(data.revenue.cancellations)} icon={XCircle} tone="red" hint={`${data.revenue.churnRate}% churn · ${signed(data.revenue.cancellationsChange)}`} hintTone="bad" />
            </div>
          </section>

          <div className="community-admin-grid-2">
            <section className="ui-card" aria-labelledby="active-title">
              <div className="ui-card-header">
                <h2 id="active-title">Monthly active members</h2>
                <span className="community-timeline-month">Weekly, last {data.activeTrend.length} weeks</span>
              </div>
              <LineChart
                points={data.activeTrend}
                label="Monthly active members"
                caption={data.activeTrend.length ? `Monthly active members: ${data.activeTrend[0].count} → ${data.activeTrend[data.activeTrend.length - 1].count}` : undefined}
              />
            </section>
            <section className="ui-card" aria-labelledby="source-title">
              <div className="ui-card-header">
                <h2 id="source-title">Revenue by source</h2>
              </div>
              <StackedBars
                items={data.revenueBySource}
                label="Revenue by source per month"
                format={(value) => usd.format(value)}
                series={[{ key: "subscriptions", label: "Subscriptions", tone: "purple" }, { key: "competitions", label: "Competitions", tone: "teal" }]}
              />
            </section>
          </div>

          <div className="community-admin-grid-2">
            <section className="ui-card" aria-labelledby="funnel-title">
              <div className="ui-card-header">
                <h2 id="funnel-title">Premium conversion funnel</h2>
                <span className="community-timeline-month">This period</span>
              </div>
              <div className="cam-funnel"><BarList items={data.funnel} empty="No visits in this period." /></div>
            </section>
            <section className="ui-card community-admin-table-card" aria-labelledby="categories-title">
              <div className="ui-card-header"><h2 id="categories-title">Top categories</h2></div>
              <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Top categories (scrolls sideways)">
                <table className="community-table cam-table-compact">
                  <thead>
                    <tr>
                      <th scope="col">Category</th>
                      <th scope="col" className="is-number">Started</th>
                      <th scope="col" className="is-number">Completed</th>
                      <th scope="col" className="is-number">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topCategories.map((row) => (
                      <tr key={row.category}>
                        <th scope="row"><strong>{row.category}</strong></th>
                        <td className="is-number">{numberFormat.format(row.started)}</td>
                        <td className="is-number">{numberFormat.format(row.completed)}</td>
                        <td className="is-number">{row.started ? Math.round((row.completed / row.started) * 100) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      )}
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

function Engagement({ e }) {
  return (
    <div className="community-admin-stats cam-stats-4">
      <StatCard label="Monthly active members" value={numberFormat.format(e.monthlyActiveMembers)} icon={Activity} tone="blue" hint={`${signed(e.monthlyActiveChange, "%")} vs prior period`} hintTone="good" />
      <StatCard label="Projects started" value={numberFormat.format(e.projectsStarted)} icon={PlayCircle} tone="sky" hint={signed(e.projectsStartedChange.toFixed(1), "%")} hintTone="good" />
      <StatCard label="Projects completed" value={numberFormat.format(e.projectsCompleted)} icon={CircleCheck} tone="green" hint={signed(e.projectsCompletedChange.toFixed(1), "%")} hintTone="good" />
      <StatCard label="Submission rate" value={`${e.submissionRate}%`} icon={ClipboardCheck} tone="teal" hint="of started projects submitted" />
      <StatCard label="Team formations" value={numberFormat.format(e.teamsFormed)} icon={Users} tone="blue" hint={`${signed(e.teamsFormedChange)} teams`} hintTone="good" />
      <StatCard label="Collaboration completion" value={`${e.collaborationCompletion}%`} icon={CheckCircle2} tone="green" hint="of teams submitted on time" />
      <StatCard label="Hackathon registrations" value={numberFormat.format(e.hackathonRegistrations)} icon={Zap} tone="amber" hint={e.hackathonName} hintTone="good" />
      <StatCard label="Competition registrations" value={numberFormat.format(e.competitionRegistrations)} icon={Trophy} tone="orange" hint={`${e.competitionFree} free · ${e.competitionPaid} paid`} />
    </div>
  );
}
