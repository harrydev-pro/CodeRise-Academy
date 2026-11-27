import { useState } from "react";
import { Download, Gift, Search, ShieldX } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import {
  exportMembersCsv,
  getAdminMembers,
  MEMBERS_PAGE_SIZE,
  PLAN_LABELS,
  restoreMember,
  suspendMember,
} from "../../../../features/community/admin/manage/adminManageService";
import { FilterSelect, MemberAvatar, SampleNotice, StatCard } from "../../../../features/community/admin/manage/manageControls";
import { downloadCsv, fullDate, numberFormat, shortDate, useToastState } from "../../../../features/community/admin/manage/manageUtils";
import GrantPremiumDialog from "../../../../features/community/admin/manage/GrantPremiumDialog";
import { readPage, useCommunityList, useDebouncedSearch, useUrlFilters } from "../../../../features/community/listHooks";
import { Pager } from "../../../../features/community/listControls";
import Modal from "../../../../components/common/Modal";

const PLAN_TONE = { free: "neutral", premium: "purple", premium_plus: "purple" };
const SUSPEND_REASONS = ["Spam or self-promotion", "Harassment or abuse", "Not their own work (plagiarism)", "Fake or copied submission", "Sharing solutions before a deadline", "Other"];
const DURATIONS = [
  { value: "1", label: "1 day" },
  { value: "3", label: "3 days" },
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "", label: "Until restored by an admin" },
];
const MESSAGE_REASON = {
  "Spam or self-promotion": "repeated spam comments",
  "Harassment or abuse": "messages that broke our rule on respect",
  "Not their own work (plagiarism)": "work that was not your own",
  "Fake or copied submission": "a copied submission",
  "Sharing solutions before a deadline": "sharing a solution before the deadline",
  Other: "a breach of the community rules",
};
const defaultMessage = (reason, days) => `Your Community access has been paused${days ? ` for ${days} ${days === "1" ? "day" : "days"}` : ""} after ${MESSAGE_REASON[reason] ?? MESSAGE_REASON.Other}. Please review the community rules.`;

function readFilters(params) {
  const pick = (name, allowed) => (allowed.includes(params.get(name)) ? params.get(name) : "");
  return {
    search: params.get("q") ?? "",
    category: params.get("category") ?? "",
    plan: pick("plan", Object.keys(PLAN_LABELS)),
    status: pick("status", ["active", "suspended"]),
    page: readPage(params),
  };
}

export default function AdminCommunityMembers() {
  const { params, update } = useUrlFilters();
  const filters = readFilters(params);
  const { data, error, loading, refreshing, reload } = useCommunityList(getAdminMembers, filters);
  const [searchText, setSearchText] = useDebouncedSearch(filters.search, (q) => update({ q }));
  const [toast, setToast, closeToast] = useToastState();
  const [toSuspend, setToSuspend] = useState(null);
  const [grantFor, setGrantFor] = useState(null); // member or {} for "choose a member"
  const [busy, setBusy] = useState("");
  const sample = Boolean(data?.isSample);
  const grantOpen = Boolean(grantFor) || params.get("grant") === "premium";

  function closeGrant() {
    setGrantFor(null);
    if (params.get("grant")) update({ grant: "", page: filters.page });
  }

  async function exportCsv() {
    setBusy("export");
    try {
      const { search, category, plan, status } = filters;
      const result = await exportMembersCsv({ search, category, plan, status }, { sample });
      downloadCsv(`community-members-${new Date().toISOString().slice(0, 10)}.csv`, result.csv ?? result.rows);
      setToast({ type: "success", message: "Member list exported as CSV." });
    } catch (exportError) {
      setToast({ type: "error", message: exportError.message || "The export failed. Please try again." });
    } finally {
      setBusy("");
    }
  }

  async function restore(member) {
    setBusy(member.id);
    try {
      await restoreMember(member.id, { sample });
      setToast({ type: "success", message: `${member.name} can use the Community again.` });
      reload();
    } catch (restoreError) {
      setToast({ type: "error", message: restoreError.message || "That didn't work. Please try again." });
    } finally {
      setBusy("");
    }
  }

  const rows = data?.members ?? [];
  const firstShown = data ? (data.pagination.page - 1) * MEMBERS_PAGE_SIZE + 1 : 0;

  return (
    <section className="admin-page community-admin cam-page">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMMUNITY MANAGEMENT</span>
          <h1>Community members</h1>
          <p>Students who have joined the Community. Uses the existing CodeRise student accounts.</p>
        </div>
        <div className="community-editor-actions">
          <button type="button" className="btn btn-outline" onClick={() => setGrantFor({})}><Gift size={17} aria-hidden="true" /> Grant Premium</button>
          <button type="button" className="btn btn-outline" onClick={exportCsv} disabled={busy === "export" || !data}><Download size={17} aria-hidden="true" /> {busy === "export" ? "Exporting…" : "Export CSV"}</button>
        </div>
      </header>

      {sample && <SampleNotice />}
      {loading && <Loader label="Loading members…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="community-admin-stats cam-stats-4">
            <StatCard label="Total members" value={numberFormat.format(data.stats.total)} />
            <StatCard label="Premium members" value={numberFormat.format(data.stats.premium)} valueTone="purple" />
            <StatCard label="Active this week" value={numberFormat.format(data.stats.activeThisWeek)} />
            <StatCard label="Suspended" value={numberFormat.format(data.stats.suspended)} valueTone="red" />
          </div>

          <section className={`ui-card community-admin-table-card${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing} aria-label="Members">
            <div className="cam-table-filters">
              <label className="community-admin-field cam-grow">
                <span className="sr-only">Search members</span>
                <span className="community-search">
                  <Search size={18} aria-hidden="true" />
                  <input type="search" className="ui-input" placeholder="Search name, username or email" value={searchText} onChange={(event) => setSearchText(event.target.value)} />
                </span>
              </label>
              <FilterSelect hideLabel label="Course" value={filters.category} onChange={(category) => update({ category })} options={[{ value: "", label: "All courses" }, ...data.categories.map((item) => ({ value: item, label: item }))]} />
              <FilterSelect hideLabel label="Plan" value={filters.plan} onChange={(plan) => update({ plan })} options={[{ value: "", label: "All plans" }, ...Object.entries(PLAN_LABELS).map(([value, label]) => ({ value, label }))]} />
              <FilterSelect hideLabel label="Status" value={filters.status} onChange={(status) => update({ status })} options={[{ value: "", label: "All statuses" }, { value: "active", label: "Active" }, { value: "suspended", label: "Suspended" }]} />
            </div>

            {rows.length === 0 ? (
              <div className="community-empty">
                <h2>No members found</h2>
                <p className="muted-text">Try a different search or filter.</p>
              </div>
            ) : (
              <>
                <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Members table (scrolls sideways)">
                  <table className="community-table cam-members-table">
                    <thead>
                      <tr>
                        <th scope="col">Member</th>
                        <th scope="col">Course</th>
                        <th scope="col">Plan</th>
                        <th scope="col" className="is-number">Points</th>
                        <th scope="col" className="is-number">Projects</th>
                        <th scope="col">Joined</th>
                        <th scope="col">Status</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((member, index) => (
                        <tr key={member.id} className={member.status === "suspended" ? "cam-row-suspended" : undefined}>
                          <th scope="row">
                            <span className="community-table-member">
                              <MemberAvatar name={member.name} index={index} />
                              <span className="cam-member-name"><strong>{member.name}</strong><small>@{member.username}</small></span>
                            </span>
                          </th>
                          <td>{member.category}</td>
                          <td><span className={`community-tag tag-${PLAN_TONE[member.plan] ?? "neutral"}`}>{PLAN_LABELS[member.plan] ?? member.plan}</span></td>
                          <td className="is-number"><strong>{numberFormat.format(member.points)}</strong></td>
                          <td className="is-number">{member.projects}</td>
                          <td>{fullDate.format(new Date(member.joinedAt)).replace(/^0/, "")}</td>
                          <td>
                            {member.status === "suspended"
                              ? <span className="community-tag tag-red" title={member.suspendedUntil ? `Until ${shortDate.format(new Date(member.suspendedUntil))}` : "Until restored"}>Suspended</span>
                              : <span className="community-tag tag-green">Active</span>}
                          </td>
                          <td>
                            <div className="cam-row-actions">
                              <a className="btn btn-outline btn-sm" href={`/community/u/${encodeURIComponent(member.username)}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${member.name}'s profile (opens in a new tab)`}>View</a>
                              {member.plan === "free" && member.status === "active" && (
                                <button type="button" className="btn btn-outline btn-sm cam-btn-premium-outline" onClick={() => setGrantFor(member)} aria-label={`Grant Premium to ${member.name}`}>Grant Premium</button>
                              )}
                              {member.status === "suspended"
                                ? <button type="button" className="btn btn-outline btn-sm" onClick={() => restore(member)} disabled={busy === member.id} aria-label={`Restore ${member.name}`}>{busy === member.id ? "Restoring…" : "Restore"}</button>
                                : <button type="button" className="btn btn-outline btn-sm community-btn-danger-outline" onClick={() => setToSuspend(member)} aria-label={`Suspend ${member.name}`}>Suspend</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="community-list-footer community-leaderboard-footer">
                  <p>Showing {firstShown}–{firstShown + rows.length - 1} of {numberFormat.format(data.pagination.total)} members</p>
                  <Pager pagination={data.pagination} onPage={(page) => update({ page })} label="Member pages" />
                </div>
              </>
            )}
          </section>
        </>
      )}

      <SuspendDialog
        key={toSuspend?.id ?? "none"}
        member={toSuspend}
        onCancel={() => setToSuspend(null)}
        onConfirm={async (values) => {
          await suspendMember(toSuspend.id, values, { sample });
          setToast({ type: "success", message: `${toSuspend.name} is suspended from the Community${values.days ? ` for ${values.days} ${values.days === 1 ? "day" : "days"}` : ""}.` });
          setToSuspend(null);
          reload();
        }}
      />
      <GrantPremiumDialog
        key={grantFor?.id ?? (grantOpen ? "open" : "closed")}
        open={grantOpen}
        member={grantFor?.id ? grantFor : null}
        sample={sample}
        onClose={closeGrant}
        onGranted={(message) => { setToast({ type: "success", message }); closeGrant(); reload(); }}
      />
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

function SuspendDialog({ member, onCancel, onConfirm }) {
  const [reason, setReason] = useState(SUSPEND_REASONS[0]);
  const [days, setDays] = useState("7");
  const [message, setMessage] = useState("");
  const [edited, setEdited] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const shownMessage = edited ? message : defaultMessage(reason, days);

  async function submit(event) {
    event.preventDefault();
    if (!shownMessage.trim()) { setError("Write a short message so the member knows why."); return; }
    setBusy(true);
    setError("");
    try {
      await onConfirm({ reason, days: days ? Number(days) : null, message: shownMessage.trim() });
    } catch (suspendError) {
      setError(suspendError.message || "The member could not be suspended. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Modal open={Boolean(member)} onClose={busy ? undefined : onCancel} title={`Suspend ${member?.name ?? "member"} from Community?`} size="max-w-lg">
      <form className="community-delete-dialog cam-confirm" onSubmit={submit} noValidate>
        <span className="community-delete-icon" aria-hidden="true"><ShieldX size={22} /></span>
        <p>They will keep access to their courses and Free Learning, but cannot post, join teams, enter hackathons or competitions while suspended.</p>
        <div className="community-field">
          <label htmlFor="suspend-reason" className="cam-label">Reason</label>
          <select id="suspend-reason" className="ui-input" value={reason} onChange={(event) => setReason(event.target.value)}>
            {SUSPEND_REASONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="community-field">
          <label htmlFor="suspend-days" className="cam-label">Duration</label>
          <select id="suspend-days" className="ui-input" value={days} onChange={(event) => setDays(event.target.value)}>
            {DURATIONS.map((item) => <option key={item.label} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <div className="community-field">
          <label htmlFor="suspend-message" className="cam-label">Message to member</label>
          <textarea id="suspend-message" className="ui-input" rows={3} value={shownMessage} aria-invalid={Boolean(error)} onChange={(event) => { setEdited(true); setMessage(event.target.value); }} />
        </div>
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="community-delete-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn-sm community-btn-danger" disabled={busy}>{busy ? "Suspending…" : "Suspend member"}</button>
        </div>
      </form>
    </Modal>
  );
}
