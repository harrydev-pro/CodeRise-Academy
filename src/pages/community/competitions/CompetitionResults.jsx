import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, MessageSquareQuote, ShieldCheck, Trophy } from "lucide-react";

import CategoryIcon from "../../../features/community/competitions/CategoryIcon";
import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { getCompetitionResults, RESULTS_PAGE_SIZE } from "../../../features/community/competitions/competitionService";
import {
  avatarTone,
  competitionPath,
  formatDate,
  formatDayMonth,
  formatNumber,
  formatScore,
} from "../../../features/community/competitions/competitionFormat";
import { Pager } from "../../../features/community/listControls";
import { readPage, useCommunityList, useUrlFilters } from "../../../features/community/listHooks";

const PLACE_LABEL = { 1: "1st place", 2: "2nd place", 3: "3rd place" };
const profilePath = (username) => `/community/u/${encodeURIComponent(username)}`;

function Avatar({ entry, size = "md" }) {
  const initials = entry.name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
  return <span className={`community-avatar community-avatar-${size} ${entry.isViewer ? "avatar-you" : avatarTone(entry.username)}`} aria-hidden="true">{initials}</span>;
}

function AwardTag({ entry }) {
  if (entry.award === "place_1") return <span className="community-tag tag-amber">Winner</span>;
  if (entry.award === "place_2") return <span className="community-tag tag-neutral">2nd place</span>;
  if (entry.award === "place_3") return <span className="community-tag tag-neutral">3rd place</span>;
  if (entry.award === "mention") return <span className="community-tag tag-blue">Honourable mention</span>;
  if (entry.points) return <span className="community-tag tag-green">+{entry.points} points</span>;
  return <span className="cmc-dash" aria-label="No award">—</span>;
}

// S19 Competition Results: /community/competitions/:id/results
export default function CompetitionResults() {
  const { id } = useParams();
  const { params, update } = useUrlFilters();
  const page = readPage(params);
  const { data, error, loading, refreshing, reload } = useCommunityList(getCompetitionResults, { id, page });
  const tableRef = useRef(null);

  if (loading) return <Loader label="Loading results…" />;
  if (error && !data) {
    return (
      <div className="cmc-page">
        <BackLink />
        <ErrorMessage message={error} onRetry={reload} />
      </div>
    );
  }

  const { results } = data;
  const { competition } = results;

  const sampleNotice = data.isSample && (
    <p className="community-sample-notice" role="status">
      Showing sample data: the Community API is not available yet. This notice only appears on the local dev server.
    </p>
  );

  if (!results.published) {
    return (
      <div className="cmc-page">
        <BackLink />
        {sampleNotice}
        <section className="community-card community-empty">
          <span className="community-icon tone-blue"><CalendarClock size={22} aria-hidden="true" /></span>
          <h1 className="cmc-empty-title">Results aren't published yet</h1>
          <p className="muted-text">Winners of {competition.title} are announced on {formatDate(competition.winnersAnnouncedAt)}. We'll post them in Announcements too.</p>
          <Link to={competitionPath(competition.id)} className="btn btn-outline">Back to competition</Link>
        </section>
      </div>
    );
  }

  const { pagination } = results;
  const first = (pagination.page - 1) * RESULTS_PAGE_SIZE + 1;
  const last = first + results.entries.length - 1;
  const viewer = results.viewerEntry;
  const viewerOnPage = viewer && results.entries.some((entry) => entry.isViewer);

  function goToPage(next) {
    update({ page: next });
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="cmc-page">
      <BackLink />

      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMPETITION RESULTS</span>
          <h1>{competition.title}</h1>
          <p>
            {competition.category} · {formatNumber(results.entriesCount)} entries · Judged by {results.judgesCount} CodeRise reviewer{results.judgesCount === 1 ? "" : "s"}
          </p>
        </div>
        <p className="cmc-official"><ShieldCheck size={18} aria-hidden="true" /> Official results published by CodeRise on {formatDayMonth(results.publishedAt)}</p>
      </header>

      {sampleNotice}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      <section aria-labelledby="cmc-winners">
        <h2 id="cmc-winners" className="sr-only">Winners</h2>
        <ol className="cmc-podium">
          {results.podium.map((entry) => (
            <li key={entry.username} className={`community-card cmc-winner place-${entry.rank}`}>
              <div className="cmc-winner-cover">
                <span className="cmc-place-badge">{entry.rank === 1 && <Trophy size={14} aria-hidden="true" />} {PLACE_LABEL[entry.rank]}</span>
                <CategoryIcon category={competition.category} size={44} strokeWidth={1.6} />
              </div>
              <div className="cmc-winner-body">
                <div className="cmc-person">
                  <Avatar entry={entry} />
                  <div className="min-w-0">
                    <Link to={profilePath(entry.username)} className="cmc-person-name">{entry.name}</Link>
                    <span>{entry.track} · {entry.city}</span>
                  </div>
                </div>
                <h3>{entry.project}</h3>
                <p className="cmc-score"><span>Score</span> <strong>{formatScore(entry.score)} / 100</strong></p>
                {entry.prize && <p className="cmc-small-note">Prize: {entry.prize}</p>}
                {entry.judgeComment && (
                  <figure className="cmc-judge-comment">
                    <figcaption><MessageSquareQuote size={15} aria-hidden="true" /> Judges' comment</figcaption>
                    <blockquote>{entry.judgeComment}</blockquote>
                  </figure>
                )}
                {entry.projectUrl ? (
                  <a href={entry.projectUrl} className="btn btn-outline btn-full" target="_blank" rel="noreferrer">
                    View project<span className="sr-only">: {entry.project} (opens in a new tab)</span>
                  </a>
                ) : (
                  <Link to={profilePath(entry.username)} className="btn btn-outline btn-full">
                    View profile<span className="sr-only">: {entry.name}</span>
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {results.mentions?.length > 0 && (
        <section className="community-card" aria-labelledby="cmc-mentions">
          <h2 className="community-side-title" id="cmc-mentions">Honourable mentions</h2>
          <ul className="cmc-mentions">
            {results.mentions.map((entry) => (
              <li key={entry.username} className="cmc-person">
                <Avatar entry={entry} />
                <div className="min-w-0">
                  <Link to={profilePath(entry.username)} className="cmc-person-name">{entry.name}</Link>
                  <span>{entry.project} · {formatScore(entry.score)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="community-card cmc-rankings" aria-labelledby="cmc-rankings" ref={tableRef}>
        <div className="cmc-rankings-head">
          <h2 className="community-side-title" id="cmc-rankings">Full rankings</h2>
          <p className="cmc-small-note">Showing {formatNumber(first)}–{formatNumber(last)} of {formatNumber(pagination.total)}</p>
        </div>
        <div className={`community-table-wrap${refreshing ? " cmc-refreshing" : ""}`} tabIndex={0} role="region" aria-label="Full rankings (scrolls sideways)" aria-busy={refreshing}>
          <table className="community-table">
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Participant</th>
                <th scope="col">Project</th>
                <th scope="col">Submitted</th>
                <th scope="col">Score</th>
                <th scope="col">Award</th>
              </tr>
            </thead>
            <tbody>
              {results.entries.map((entry) => <RankingRow key={entry.username} entry={entry} />)}
              {viewer && !viewerOnPage && <RankingRow entry={viewer} />}
            </tbody>
          </table>
        </div>
        <div className="community-list-footer cmc-rankings-footer">
          {results.viewerFeedback?.length > 0 ? <a href="#judges-feedback" className="text-link">Read your judges' feedback</a> : <span />}
          <Pager pagination={pagination} onPage={goToPage} label="Ranking pages" />
        </div>
      </section>

      {results.viewerFeedback?.length > 0 && viewer && (
        <section className="community-card cmc-feedback" id="judges-feedback" aria-labelledby="cmc-feedback-title" tabIndex={-1}>
          <h2 className="community-side-title" id="cmc-feedback-title">Your judges' feedback</h2>
          <p className="cmc-section-intro">
            {viewer.project} · Rank {formatNumber(viewer.rank)} · Score {formatScore(viewer.score)} / 100. Only you can see this feedback.
          </p>
          <ul className="cmc-feedback-list">
            {results.viewerFeedback.map((item) => (
              <li key={item.judge}>
                <div className="cmc-feedback-head">
                  <strong>{item.judge}</strong>
                  <span className="community-tag tag-blue">{formatScore(item.score)} / 100</span>
                </div>
                <p>{item.comment}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function RankingRow({ entry }) {
  return (
    <tr className={entry.isViewer ? "is-viewer" : undefined}>
      <td className="community-table-rank">{formatNumber(entry.rank)}</td>
      <td>
        <Link to={profilePath(entry.username)} className="cmc-table-link">
          {entry.isViewer ? <strong>You · {entry.name}</strong> : entry.name}
        </Link>
      </td>
      <td>{entry.project}</td>
      <td>{formatDayMonth(entry.submittedAt)}</td>
      <td><strong>{formatScore(entry.score)}</strong></td>
      <td><AwardTag entry={entry} /></td>
    </tr>
  );
}

function BackLink() {
  return (
    <Link to="/community/competitions" className="cmc-back">
      <ArrowLeft size={17} aria-hidden="true" /> All competitions
    </Link>
  );
}
