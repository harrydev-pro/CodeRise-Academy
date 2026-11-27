import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChartNoAxesColumn, Heart, Monitor, Palette, Plus, ReceiptText, Smartphone } from "lucide-react";

import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import Toast from "../../components/feedback/Toast";
import {
  appreciateShowcaseProject,
  commentOnShowcaseProject,
  getShowcase,
  getShowcaseProject,
  reportCommunityContent,
  setFollowing,
  setShowcaseLike,
  SHOWCASE_PAGE_SIZE,
} from "../../features/community/communityService";
import { FilterChip, Pager } from "../../features/community/listControls";
import { readPage, useCommunityList, useUrlFilters } from "../../features/community/listHooks";
import { useAuth } from "../../hooks/useAuth";

const SORTS = [
  { value: "appreciated", label: "Most appreciated" },
  { value: "liked", label: "Most liked" },
  { value: "newest", label: "Newest" },
];
const CATEGORY_STYLE = {
  Frontend: { icon: Monitor, tone: "blue" },
  "Product Design": { icon: Smartphone, tone: "purple" },
  "Data Analysis": { icon: ChartNoAxesColumn, tone: "teal" },
  "Graphic Design": { icon: Palette, tone: "pink" },
  Mobile: { icon: ReceiptText, tone: "orange" },
};
const REPORT_REASONS = ["Spam or advertising", "Inappropriate or offensive", "Not the creator's own work", "Harassment", "Something else"];
const COMMENT_LIMIT = 1000;

const numberFormat = new Intl.NumberFormat("en-GB");
const compactFormat = new Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 1 });
const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const fullDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}
// The same person always gets the same avatar colour.
function avatarTone(username = "") {
  let hash = 0;
  for (const char of username) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return `avatar-${hash % 4}`;
}
function timeAgo(iso) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  if (minutes < 10080) return `${Math.floor(minutes / 1440)}d`;
  return dayMonth.format(new Date(iso));
}

const loadDetail = ({ id }) => (id ? getShowcaseProject({ id }) : Promise.resolve(null));

export default function ProjectShowcase() {
  const { user } = useAuth();
  const { params, update } = useUrlFilters({ sort: "appreciated" });
  const category = params.get("category") ?? "";
  const sort = SORTS.some((item) => item.value === params.get("sort")) ? params.get("sort") : "appreciated";
  const page = readPage(params);
  const list = useCommunityList(getShowcase, { category, sort, page });
  const data = list.data;
  const sample = Boolean(data?.isSample);

  const selectedId = params.get("project") || data?.projects?.[0]?.id || "";
  const detail = useCommunityList(loadDetail, { id: selectedId });

  // Changes the viewer makes on this page (likes, comments, follows), layered over the server data.
  const [projectChanges, setProjectChanges] = useState({});
  const [follows, setFollows] = useState({});
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const panelRef = useRef(null);
  const listTop = useRef(null);

  const withChanges = (project) => (project ? { ...project, ...projectChanges[project.id] } : project);
  const isFollowing = (username, fallback) => follows[username] ?? Boolean(fallback);
  const changeProject = (id, changes) => setProjectChanges((current) => ({ ...current, [id]: { ...current[id], ...changes } }));

  // On narrow screens the panel sits below the list, so jump to it once the project has loaded.
  const scrollWhenLoaded = useRef(false);
  const loadedId = detail.data?.project?.id;
  useEffect(() => {
    if (scrollWhenLoaded.current && loadedId === selectedId) {
      scrollWhenLoaded.current = false;
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loadedId, selectedId]);

  function openProject(id) {
    update({ project: id, page });
    scrollWhenLoaded.current = window.matchMedia("(max-width: 1099px)").matches;
  }

  async function toggleLike(project) {
    const liked = !project.viewerLiked;
    const before = { viewerLiked: project.viewerLiked, likes: project.likes };
    changeProject(project.id, { viewerLiked: liked, likes: project.likes + (liked ? 1 : -1) });
    try {
      await setShowcaseLike(project.id, liked, { sample });
    } catch (error) {
      changeProject(project.id, before);
      setToast({ type: "error", message: error.message || "Your like could not be saved." });
    }
  }

  async function appreciate(project) {
    if (project.viewerAppreciated) return;
    changeProject(project.id, { viewerAppreciated: true, appreciations: (project.appreciations ?? 0) + 1 });
    try {
      await appreciateShowcaseProject(project.id, { sample });
      setToast({ type: "success", message: `You appreciated ${project.author.name}'s work.` });
    } catch (error) {
      changeProject(project.id, { viewerAppreciated: false, appreciations: project.appreciations });
      setToast({ type: "error", message: error.message || "Your appreciation could not be saved." });
    }
  }

  async function toggleFollow(person) {
    const following = !isFollowing(person.username, person.viewerFollowing);
    setFollows((current) => ({ ...current, [person.username]: following }));
    try {
      await setFollowing(person.username, following, { sample });
    } catch (error) {
      setFollows((current) => ({ ...current, [person.username]: !following }));
      setToast({ type: "error", message: error.message || "That change could not be saved." });
    }
  }

  async function share(project) {
    const url = `${window.location.origin}/community/showcase?project=${encodeURIComponent(project.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: project.title, text: `${project.title} by ${project.author.name}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setToast({ type: "success", message: "Link copied." });
    } catch (error) {
      if (error?.name !== "AbortError") setToast({ type: "error", message: "The link could not be copied." });
    }
  }

  async function postComment(project, body) {
    const author = { name: user?.name || user?.fullName || "You", username: data?.viewerUsername ?? "" };
    const result = await commentOnShowcaseProject(project.id, body, { sample, author });
    const comment = result?.comment ?? result;
    changeProject(project.id, {
      addedComments: [...(project.addedComments ?? []), comment],
      commentsCount: project.commentsCount + 1,
    });
  }

  if (list.loading) return <Loader label="Loading the showcase…" />;
  if (list.error && !data) return <ErrorMessage message={list.error} onRetry={list.reload} />;

  const potm = data.projectOfTheMonth;
  const openedProject = detail.data?.project ? withChanges(detail.data.project) : null;
  const { pagination } = data;
  const firstShown = (pagination.page - 1) * SHOWCASE_PAGE_SIZE + 1;

  return (
    <div className="community-library">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">PROJECT SHOWCASE</span>
          <h1>Built by the CodeRise community</h1>
          <p>Completed projects shared by learners. Like, comment and follow the people whose work inspires you.</p>
        </div>
        <Link to="/community/my-projects" className="btn btn-primary"><Plus size={17} aria-hidden="true" /> Share a project</Link>
      </header>

      {sample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. Likes, comments and follows only change on screen. This notice only appears on the local dev server.
        </p>
      )}

      {potm && (
        <section className="community-potm" aria-labelledby="potm-heading">
          <div className="min-w-0">
            <span className="community-spotlight-eyebrow">PROJECT OF THE MONTH · {potm.month.toUpperCase()}</span>
            <h2 id="potm-heading">{potm.title}</h2>
            <p>{potm.description}</p>
            <ul className="community-potm-tags" aria-label="Built with">
              {potm.tags.map((tag) => <li key={tag}>{tag}</li>)}
              <li>{numberFormat.format(potm.likes)} likes</li>
            </ul>
          </div>
          <div className="community-potm-side">
            <div className="community-potm-author">
              <span className="community-avatar avatar-0 community-avatar-lg" aria-hidden="true">{initials(potm.author.name)}</span>
              <span>
                <strong>{potm.author.name}</strong>
                <small>{potm.author.track} · {numberFormat.format(potm.author.points)} pts</small>
              </span>
            </div>
            <button type="button" className="btn community-btn-light" onClick={() => openProject(potm.id)}>View project</button>
          </div>
        </section>
      )}

      <div className="community-hackathon-toolbar">
        <div className="community-chips community-chips-outline" role="group" aria-label="Category">
          <FilterChip active={!category} onClick={() => update({ category: "" })}>All</FilterChip>
          {data.categories.map((item) => (
            <FilterChip key={item} active={category === item} onClick={() => update({ category: item })}>{item}</FilterChip>
          ))}
        </div>
        <label className="community-sort">
          <span>Sort by</span>
          <select value={sort} onChange={(event) => update({ sort: event.target.value })}>
            {SORTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
      </div>

      {list.error && <ErrorMessage message={list.error} onRetry={list.reload} />}

      <div className="community-showcase-layout">
        <div className="community-showcase-main" ref={listTop}>
          {data.projects.length === 0 ? (
            <div className="community-card community-empty">
              <span className="community-icon tone-blue"><Palette size={22} aria-hidden="true" /></span>
              <h2>No projects here yet</h2>
              <p className="muted-text">Finish a project and share it to be the first in this category.</p>
            </div>
          ) : (
            <>
              <div className={`community-showcase-grid${list.refreshing ? " is-refreshing" : ""}`} aria-busy={list.refreshing}>
                {data.projects.map((project) => (
                  <ShowcaseCard
                    key={project.id}
                    project={withChanges(project)}
                    selected={project.id === selectedId}
                    isOwn={project.author.username === data.viewerUsername}
                    onOpen={() => openProject(project.id)}
                  />
                ))}
              </div>
              <div className="community-list-footer">
                <p>Showing {firstShown}–{firstShown + data.projects.length - 1} of {pagination.total} projects</p>
                <Pager
                  pagination={pagination}
                  label="Showcase pages"
                  onPage={(next) => {
                    update({ page: next, project: "" });
                    listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                />
              </div>
            </>
          )}
        </div>

        <aside className="community-showcase-side" aria-label="Project and creators">
          <section className="community-card community-opened" ref={panelRef} aria-labelledby="opened-title" aria-busy={detail.refreshing || detail.loading}>
            {detail.loading && <Loader label="Opening project…" />}
            {detail.error && <ErrorMessage message={detail.error} onRetry={detail.reload} />}
            {openedProject && (
              <OpenedProject
                key={openedProject.id}
                project={openedProject}
                isOwn={openedProject.author.username === data.viewerUsername}
                following={isFollowing(openedProject.author.username, openedProject.author.viewerFollowing)}
                onFollow={() => toggleFollow(openedProject.author)}
                onLike={() => toggleLike(openedProject)}
                onAppreciate={() => appreciate(openedProject)}
                onShare={() => share(openedProject)}
                onComment={(body) => postComment(openedProject, body)}
                onReport={(report) => reportCommunityContent({ targetType: "showcase_project", targetId: openedProject.id, ...report }, { sample })}
                onToast={setToast}
              />
            )}
          </section>

          {data.topCreators?.length > 0 && (
            <section className="community-card" aria-labelledby="creators-title">
              <h2 id="creators-title" className="community-side-title">Top creators this month</h2>
              <ul className="community-list">
                {data.topCreators.map((creator) => {
                  const following = isFollowing(creator.username, creator.viewerFollowing);
                  return (
                    <li key={creator.username} className="community-creator">
                      <span className={`community-avatar ${avatarTone(creator.username)}`} aria-hidden="true">{initials(creator.name)}</span>
                      <Link to={`/community/u/${encodeURIComponent(creator.username)}`} className="community-creator-name">
                        <strong>{creator.name}</strong>
                        <span>{creator.projects} projects · {numberFormat.format(creator.likes)} likes</span>
                      </Link>
                      {creator.username !== data.viewerUsername && (
                        <FollowButton following={following} name={creator.name} onClick={() => toggleFollow(creator)} />
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </aside>
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </div>
  );
}

function FollowButton({ following, name, onClick }) {
  return (
    <button
      type="button"
      className={`btn btn-sm ${following ? "btn-primary" : "btn-outline"}`}
      aria-pressed={following}
      aria-label={`${following ? "Following" : "Follow"} ${name}`}
      onClick={onClick}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}

function ShowcaseCard({ project, selected, isOwn, onOpen }) {
  const style = CATEGORY_STYLE[project.category] ?? { icon: Monitor, tone: "blue" };
  const Icon = style.icon;
  return (
    <article className={`community-card community-project community-showcase-card${selected ? " is-selected" : ""}`}>
      <div className={`community-project-cover cover-${style.tone}`}>
        <span className={`community-access community-category-tag tag-${style.tone}`}>{project.category}</span>
        <Icon size={44} strokeWidth={1.6} aria-hidden="true" />
      </div>
      <div className="community-project-body">
        <h3>
          <button type="button" className="community-card-open" onClick={onOpen} aria-pressed={selected}>
            {project.title}
          </button>
        </h3>
        <p className="community-showcase-author">
          <span className={`community-avatar community-avatar-sm ${avatarTone(project.author.username)}`} aria-hidden="true">{initials(project.author.name)}</span>
          {project.author.name} · {dayMonth.format(new Date(project.completedAt))}
        </p>
        <ul className="community-skill-list" aria-label="Built with">
          {project.tags.map((tag) => <li key={tag} className="community-skill">{tag}</li>)}
        </ul>
        <div className="community-showcase-stats">
          <span>{numberFormat.format(project.likes)} likes · {numberFormat.format(project.commentsCount)} comments</span>
          {isOwn ? <span className="community-chip">Your project</span> : (
            <span className="community-showcase-links">
              {project.links.map((item, index) => (
                <span key={item.label}>
                  {index > 0 && " · "}
                  <a href={item.url} target="_blank" rel="noopener noreferrer">{item.label}<span className="sr-only"> (opens in a new tab)</span></a>
                </span>
              ))}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function OpenedProject({ project, isOwn, following, onFollow, onLike, onAppreciate, onShare, onComment, onReport, onToast }) {
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const comments = [...(project.comments ?? []), ...(project.addedComments ?? [])];
  const live = project.links.find((item) => item.label === "Live");
  const code = project.links.find((item) => item.label === "GitHub");
  const others = project.links.filter((item) => item !== live && item !== code);

  async function submit(event) {
    event.preventDefault();
    const body = comment.trim();
    if (!body) { setCommentError("Write a comment before posting."); return; }
    if (body.length > COMMENT_LIMIT) { setCommentError(`Comments can be up to ${COMMENT_LIMIT} characters.`); return; }
    setPosting(true);
    setCommentError("");
    try {
      await onComment(body);
      setComment("");
    } catch (error) {
      setCommentError(error.message || "Your comment could not be posted. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <>
      <span className="eyebrow">OPENED PROJECT</span>
      <h2 id="opened-title" className="community-opened-title">{project.title}</h2>

      <div className="community-opened-author">
        <span className={`community-avatar ${avatarTone(project.author.username)}`} aria-hidden="true">{initials(project.author.name)}</span>
        <Link to={`/community/u/${encodeURIComponent(project.author.username)}`} className="community-creator-name">
          <strong>{project.author.name}</strong>
          <span>{project.author.track}{typeof project.author.followers === "number" ? ` · ${compactFormat.format(project.author.followers)} followers` : ""}</span>
        </Link>
        {!isOwn && <FollowButton following={following} name={project.author.name} onClick={onFollow} />}
      </div>

      <p className="community-opened-text">
        {project.description} Completed {fullDate.format(new Date(project.completedAt))}{project.source ? ` as part of the ${project.source}` : ""}.
      </p>

      <div className="community-opened-actions">
        <button type="button" className={`btn btn-sm ${project.viewerLiked ? "btn-primary" : "btn-outline"}`} aria-pressed={project.viewerLiked} onClick={onLike}>
          <Heart size={16} aria-hidden="true" fill={project.viewerLiked ? "currentColor" : "none"} />
          {project.viewerLiked ? "Liked" : "Like"} · {numberFormat.format(project.likes)}
        </button>
        {!isOwn && (
          <button type="button" className="btn btn-outline btn-sm" onClick={onAppreciate} disabled={project.viewerAppreciated} aria-pressed={project.viewerAppreciated}>
            {project.viewerAppreciated ? "Appreciated" : "Appreciate"}
          </button>
        )}
        <button type="button" className="btn btn-outline btn-sm" onClick={onShare}>Share</button>
      </div>

      {project.links.length > 0 && (
        <p className="community-opened-links">
          {live && <a href={live.url} target="_blank" rel="noopener noreferrer">Live preview<span className="sr-only"> (opens in a new tab)</span></a>}
          {code && <a href={code.url} target="_blank" rel="noopener noreferrer">GitHub repository<span className="sr-only"> (opens in a new tab)</span></a>}
          {others.map((item) => <a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer">{item.label}<span className="sr-only"> (opens in a new tab)</span></a>)}
        </p>
      )}

      <div className="community-comments">
        <h3>Comments ({numberFormat.format(project.commentsCount)})</h3>
        {project.commentsCount === 0 && comments.length === 0 && <p className="muted-text">No comments yet. Be the first to say something kind.</p>}
        {comments.length > 0 && (
          <ul className="community-list">
            {comments.map((item) => (
              <li key={item.id} className="community-comment">
                <span className={`community-avatar community-avatar-sm ${avatarTone(item.author.username)}`} aria-hidden="true">{initials(item.author.name)}</span>
                <div className="min-w-0">
                  <p className="community-comment-head">
                    <strong>{item.author.name}</strong>
                    {item.isCreator && <span className="community-tag tag-neutral">Creator</span>}
                    <time dateTime={item.createdAt}>{timeAgo(item.createdAt)}</time>
                  </p>
                  <p className="community-comment-body">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {comments.length > 0 && project.commentsCount > comments.length && (
          <p className="community-comments-more">Showing the latest {comments.length} of {numberFormat.format(project.commentsCount)} comments.</p>
        )}

        <form className="community-comment-form" onSubmit={submit} noValidate>
          <label htmlFor={`comment-${project.id}`}>Add a comment</label>
          <textarea
            id={`comment-${project.id}`}
            className="ui-input"
            rows={3}
            maxLength={COMMENT_LIMIT}
            placeholder="Write something encouraging…"
            value={comment}
            aria-invalid={Boolean(commentError)}
            aria-describedby={commentError ? `comment-error-${project.id}` : undefined}
            onChange={(event) => { setComment(event.target.value); if (commentError) setCommentError(""); }}
          />
          {commentError && <p id={`comment-error-${project.id}`} className="field-error">{commentError}</p>}
          <div className="community-comment-actions">
            {!isOwn ? <button type="button" className="community-report-link" onClick={() => setReportOpen(true)}>Report this project</button> : <span />}
            <button type="submit" className="btn btn-primary btn-sm" disabled={posting}>{posting ? "Posting…" : "Post comment"}</button>
          </div>
        </form>
      </div>

      <ReportDialog
        open={reportOpen}
        title={project.title}
        onClose={() => setReportOpen(false)}
        onSubmit={async (report) => {
          await onReport(report);
          setReportOpen(false);
          onToast({ type: "success", message: "Thanks for letting us know. A moderator will review this project." });
        }}
      />
    </>
  );
}

function ReportDialog({ open, title, onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function close() {
    setReason("");
    setDetails("");
    setError("");
    onClose();
  }

  async function submit(event) {
    event.preventDefault();
    if (!reason) { setError("Choose a reason."); return; }
    setSending(true);
    setError("");
    try {
      await onSubmit({ reason, details: details.trim() });
      setReason("");
      setDetails("");
    } catch (submitError) {
      setError(submitError.message || "Your report could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal open={open} onClose={close} title="Report this project" description={`Tell our moderators what's wrong with "${title}". The creator won't see who reported it.`}>
      <form className="community-report-form" onSubmit={submit} noValidate>
        <fieldset>
          <legend>Reason</legend>
          {REPORT_REASONS.map((item) => (
            <label key={item} className="community-radio">
              <input type="radio" name="report-reason" value={item} checked={reason === item} onChange={() => { setReason(item); setError(""); }} />
              {item}
            </label>
          ))}
        </fieldset>
        <label htmlFor="report-details">More details (optional)</label>
        <textarea id="report-details" className="ui-input" rows={3} maxLength={500} value={details} onChange={(event) => setDetails(event.target.value)} />
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="community-comment-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={close}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={sending}>{sending ? "Sending…" : "Send report"}</button>
        </div>
      </form>
    </Modal>
  );
}
