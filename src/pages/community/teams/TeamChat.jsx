import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ClipboardCheck, Flag, Hash, Paperclip, Pin, PinOff, Search, X } from "lucide-react";

import Loader from "../../../components/common/Loader";
import Modal from "../../../components/common/Modal";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { reportCommunityContent } from "../../../features/community/communityService";
import { useCommunityList } from "../../../features/community/listHooks";
import { Avatar, FileIcon } from "../../../features/community/teams/teamComponents";
import { dayKeyOf, firstName, formatBytes, longDay, timeAgo, timeOfDay, useTeamWorkspace } from "../../../features/community/teams/teamHelpers";
import { getTeamChat, sendTeamMessage, setMessagePinned, TEAM_FILE_LIMIT_BYTES, uploadTeamAttachment } from "../../../features/community/teams/teamsService";

const MESSAGE_MAX = 2000;
const REPORT_REASONS = ["Harassment or bullying", "Spam", "Inappropriate or offensive", "Cheating or plagiarism", "Something else"];

// S09b Team chat: /community/teams/:teamId/chat?channel=
export default function TeamChat() {
  const { team, sample, notify } = useTeamWorkspace();
  const [params, setParams] = useSearchParams();
  const channel = params.get("channel") || "general";
  const { data, error, loading, refreshing, reload } = useCommunityList(getTeamChat, { teamId: team.id, channel });
  const [showPinned, setShowPinned] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [reporting, setReporting] = useState(null);
  const [pinning, setPinning] = useState("");
  const listRef = useRef(null);

  const messageCount = data?.messages?.length ?? 0;
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messageCount, channel]);

  if (loading) return <Loader label="Loading team chat…" />;
  if (error && !data) return <ErrorMessage message={error} onRetry={reload} />;

  const current = data.channels.find((item) => item.id === data.channel) ?? data.channels[0];
  const term = search.trim().toLowerCase();
  const visible = data.messages.filter((message) => (!showPinned || message.pinned) && (!term || `${message.body} ${message.author?.name ?? ""}`.toLowerCase().includes(term)));
  const firstNames = team.members.map((member) => firstName(member.name));

  function openChannel(id) {
    setParams(id === "general" ? {} : { channel: id });
    setShowPinned(false);
    setSearch("");
  }

  async function togglePin(message) {
    setPinning(message.id);
    try {
      await setMessagePinned(team.id, message.id, !message.pinned, { sample });
      notify({ type: "success", message: message.pinned ? "Message unpinned." : "Message pinned for the whole team." });
      reload();
    } catch (pinError) {
      notify({ type: "error", message: pinError.message || "The message could not be pinned." });
    } finally {
      setPinning("");
    }
  }

  return (
    <div className="cmt-layout cmt-layout-wide">
      <section className="community-card cmt-chat" aria-labelledby="channel-title">
        <div className="cmt-chat-head">
          <h2 id="channel-title" className="cmt-channel-title"># {current.name}</h2>
          <p className="cmt-card-sub">{team.name} · {team.members.length} members · messages are visible to your team and CodeRise moderators</p>
          <div className="cmt-button-row">
            <button type="button" className="btn btn-outline btn-sm" aria-pressed={showPinned} onClick={() => setShowPinned((value) => !value)}>
              <Pin size={14} aria-hidden="true" /> Pinned ({data.messages.filter((message) => message.pinned).length})
            </button>
            <button type="button" className="btn btn-outline btn-sm" aria-expanded={searchOpen} aria-controls="chat-search" onClick={() => { setSearchOpen((value) => !value); setSearch(""); }}>
              <Search size={14} aria-hidden="true" /> Search
            </button>
          </div>
          {searchOpen && (
            <label className="community-search cmt-chat-search" id="chat-search">
              <span className="sr-only">Search messages in #{current.name}</span>
              <Search size={16} aria-hidden="true" />
              <input type="search" className="ui-input" placeholder={`Search #${current.name}`} value={search} onChange={(event) => setSearch(event.target.value)} autoFocus />
            </label>
          )}
        </div>

        <div className={`cmt-messages${refreshing ? " is-refreshing" : ""}`} ref={listRef} tabIndex={0} role="log" aria-label={`Messages in #${current.name}`} aria-busy={refreshing}>
          {visible.length === 0 ? (
            <p className="cmt-column-empty">{showPinned ? "No pinned messages in this channel." : term ? "No messages match your search." : "No messages yet. Start the conversation."}</p>
          ) : (
            <ul className="cmt-message-list">
              {visible.map((message, index) => {
                const day = dayKeyOf(message.createdAt);
                // Group messages under a date heading.
                const showDay = index === 0 || day !== dayKeyOf(visible[index - 1].createdAt);
                const own = message.author?.username === team.viewerUsername;
                return (
                  <li key={message.id}>
                    {showDay && <p className="cmt-day"><span>{longDay.format(new Date(message.createdAt))}</span></p>}
                    {message.type === "event" ? (
                      <div className="cmt-event">
                        <span className="community-icon tone-blue"><ClipboardCheck size={18} aria-hidden="true" /></span>
                        <div className="min-w-0">
                          <strong>{message.event?.title ?? "Update"}</strong>
                          <p>{message.body} · {timeOfDay.format(new Date(message.createdAt))}</p>
                        </div>
                        {message.event?.taskId && <Link to={`/community/teams/${encodeURIComponent(team.id)}/tasks`} className="btn btn-outline btn-sm">View task</Link>}
                      </div>
                    ) : (
                      <div className={`cmt-message${own ? " is-own" : ""}`}>
                        <Avatar name={message.author.name} username={message.author.username} viewer={own} />
                        <div className="cmt-message-body">
                          <p className="cmt-message-meta">
                            <strong>{own ? "You" : message.author.name}</strong>
                            <time dateTime={message.createdAt}>{timeOfDay.format(new Date(message.createdAt))}</time>
                            {message.pinned && <span className="community-tag tag-amber"><Pin size={11} aria-hidden="true" /> Pinned</span>}
                          </p>
                          {message.body && <p className="cmt-message-text"><MessageText text={message.body} names={firstNames} /></p>}
                          {message.attachment && <Attachment attachment={message.attachment} />}
                          <div className="cmt-message-actions">
                            <button type="button" className="cmt-text-button" disabled={pinning === message.id} onClick={() => togglePin(message)}>
                              {message.pinned ? <PinOff size={13} aria-hidden="true" /> : <Pin size={13} aria-hidden="true" />}
                              {message.pinned ? "Unpin" : "Pin"}<span className="sr-only"> message from {message.author.name}</span>
                            </button>
                            {!own && (
                              <button type="button" className="cmt-text-button is-danger" onClick={() => setReporting(message)}>
                                <Flag size={13} aria-hidden="true" /> Report<span className="sr-only"> message from {message.author.name}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Composer key={current.id} team={team} channel={current} sample={sample} onSent={reload} notify={notify} />
      </section>

      <aside className="cmt-side" aria-label="Channels, members and pinned messages">
        <section className="community-card" aria-labelledby="channels-title">
          <h2 id="channels-title" className="cmt-card-title">Channels</h2>
          <ul className="cmt-nav-list">
            {data.channels.map((item) => (
              <li key={item.id}>
                <button type="button" className={`cmt-nav-item${item.id === current.id ? " active" : ""}`} aria-current={item.id === current.id ? "true" : undefined} onClick={() => openChannel(item.id)}>
                  <span><Hash size={15} aria-hidden="true" /> {item.name}</span>
                  {item.unread > 0 && item.id !== current.id && <span className="cmt-tab-badge">{item.unread} new</span>}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="community-card" aria-labelledby="chat-members-title">
          <h2 id="chat-members-title" className="cmt-card-title">Members</h2>
          <ul className="community-list">
            {team.members.map((member) => (
              <li key={member.username} className="cmt-presence">
                <Avatar name={member.name} username={member.username} viewer={member.username === team.viewerUsername} />
                <span className="cmt-file-name">
                  <strong>{member.name}</strong>
                  <small>{member.isLeader ? "Leader · " : ""}{member.role} · {member.online ? "online" : `last seen ${timeAgo(member.lastSeenAt)}`}</small>
                </span>
                <span className={`cmt-dot${member.online ? " is-online" : ""}`} role="img" aria-label={member.online ? "Online" : "Offline"} />
              </li>
            ))}
          </ul>
        </section>

        <section className="community-card" aria-labelledby="pinned-title">
          <h2 id="pinned-title" className="cmt-card-title">Pinned</h2>
          {data.pinned.length === 0 ? (
            <p className="cmt-card-sub">Pin important messages so everyone can find them.</p>
          ) : (
            <ul className="cmt-pinned-list">
              {data.pinned.map((message) => (
                <li key={message.id}>
                  <p>{message.body}</p>
                  <small>{firstName(message.author?.name)} in #{message.channel}</small>
                </li>
              ))}
            </ul>
          )}
          <p className="cmt-muted-small">See something that breaks the community rules? Use Report on the message.</p>
        </section>
      </aside>

      <ReportMessageDialog
        message={reporting}
        onClose={() => setReporting(null)}
        onSubmit={async (report) => {
          await reportCommunityContent({ targetType: "team_message", targetId: reporting.id, teamId: team.id, ...report }, { sample });
          setReporting(null);
          notify({ type: "success", message: "Thanks for letting us know. A moderator will review this message." });
        }}
      />
    </div>
  );
}

function MessageText({ text, names }) {
  const parts = text.split(/(@[A-Za-z][\w.-]*)/g);
  return parts.map((part, index) => (
    part.startsWith("@") && names.some((name) => name.toLowerCase() === part.slice(1).toLowerCase())
      ? <span key={index} className="cmt-mention">{part}</span>
      : <span key={index}>{part}</span>
  ));
}

function Attachment({ attachment }) {
  const content = (
    <>
      <FileIcon kind={attachment.kind} />
      <span className="cmt-file-name">
        <strong>{attachment.name}</strong>
        <small>{attachment.kind === "figma" ? "Figma link" : formatBytes(attachment.size)}</small>
      </span>
    </>
  );
  if (!attachment.url) return <div className="cmt-attachment">{content}</div>;
  return (
    <a className="cmt-attachment" href={attachment.url} target="_blank" rel="noopener noreferrer">
      {content}<span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function Composer({ team, channel, sample, onSent, notify }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  const mentionMatch = /(^|\s)@([A-Za-z]*)$/.exec(text);
  const suggestions = mentionMatch
    ? team.members.filter((member) => member.username !== team.viewerUsername && firstName(member.name).toLowerCase().startsWith(mentionMatch[2].toLowerCase()))
    : [];

  function insertMention(member) {
    setText(text.replace(/@([A-Za-z]*)$/, `@${firstName(member.name)} `));
    inputRef.current?.focus();
  }

  function chooseFile(event) {
    const chosen = event.target.files?.[0];
    event.target.value = "";
    if (!chosen) return;
    if (chosen.size > TEAM_FILE_LIMIT_BYTES) {
      setError(`${chosen.name} is ${formatBytes(chosen.size)}. Files must be 25 MB or smaller — share a link instead.`);
      return;
    }
    setError("");
    setFile(chosen);
  }

  async function send(event) {
    event.preventDefault();
    const body = text.trim();
    if (!body && !file) { setError("Write a message or attach a file."); return; }
    if (body.length > MESSAGE_MAX) { setError(`Messages can be up to ${MESSAGE_MAX} characters.`); return; }
    setSending(true);
    setError("");
    try {
      const attachment = file ? await uploadTeamAttachment(file, { sample }) : null;
      const mentions = team.members.filter((member) => new RegExp(`@${firstName(member.name)}\\b`, "i").test(body)).map((member) => member.username);
      await sendTeamMessage(team.id, { channel: channel.id, body, mentions, attachment }, { sample });
      setText("");
      setFile(null);
      onSent();
    } catch (sendError) {
      setError(sendError.message || "Your message could not be sent. It's still in the box, so you can try again.");
      notify({ type: "error", message: "Message not sent." });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="cmt-composer" onSubmit={send} noValidate>
      {suggestions.length > 0 && (
        <ul className="cmt-mentions" aria-label="Mention a teammate">
          {suggestions.map((member) => (
            <li key={member.username}>
              <button type="button" onClick={() => insertMention(member)}>
                <Avatar name={member.name} username={member.username} size="sm" /> {member.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {file && (
        <p className="cmt-attached">
          <Paperclip size={14} aria-hidden="true" /> {file.name} · {formatBytes(file.size)}
          <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFile(null)}><X size={14} aria-hidden="true" /></button>
        </p>
      )}
      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="cmt-composer-row">
        <input ref={fileRef} type="file" className="sr-only" id="chat-file" tabIndex={-1} onChange={chooseFile} />
        <button type="button" className="btn btn-outline cmt-icon-btn" aria-label="Attach a file (up to 25 MB)" onClick={() => fileRef.current?.click()}>
          <Paperclip size={18} aria-hidden="true" />
        </button>
        <label htmlFor="chat-message" className="sr-only">Message #{channel.name}</label>
        <input
          ref={inputRef}
          id="chat-message"
          className="ui-input"
          autoComplete="off"
          maxLength={MESSAGE_MAX}
          placeholder={`Message #${channel.name} — use @ to mention a teammate`}
          value={text}
          onChange={(event) => { setText(event.target.value); if (error) setError(""); }}
        />
        <button type="submit" className="btn btn-primary" disabled={sending}>{sending ? "Sending…" : "Send"}</button>
      </div>
    </form>
  );
}

function ReportMessageDialog({ message, onClose, onSubmit }) {
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
    <Modal open={Boolean(message)} onClose={close} title="Report this message" description={message ? `Tell our moderators what's wrong with ${message.author?.name}'s message. They won't see who reported it.` : ""}>
      <form className="community-report-form" onSubmit={submit} noValidate>
        {message && <blockquote className="cmt-quote">{message.body}</blockquote>}
        <fieldset>
          <legend>Reason</legend>
          {REPORT_REASONS.map((item) => (
            <label key={item} className="community-radio">
              <input type="radio" name="message-report-reason" value={item} checked={reason === item} onChange={() => { setReason(item); setError(""); }} />
              {item}
            </label>
          ))}
        </fieldset>
        <label htmlFor="message-report-details">More details (optional)</label>
        <textarea id="message-report-details" className="ui-input" rows={3} maxLength={500} value={details} onChange={(event) => setDetails(event.target.value)} />
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="community-comment-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={close}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={sending}>{sending ? "Sending…" : "Send report"}</button>
        </div>
      </form>
    </Modal>
  );
}
