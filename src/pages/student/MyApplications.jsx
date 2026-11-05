import { useState } from "react";
import { CalendarDays, ChevronDown, FileText } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { PageHeader, StatusBadge } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { getProgramPrice } from "../../utils/programPrice";

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div className="application-detail-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function MyApplications() {
  const { data: applications, loading, error, reload } = useApiResource("/applications/me", "applications");
  const [openId, setOpenId] = useState(null);

  if (loading) return <div className="student-page"><Loader label="Loading your applications…" /></div>;
  if (error) return <div className="student-page"><ErrorMessage message={error} onRetry={reload} /></div>;

  return (
    <div className="student-page">
      <PageHeader eyebrow="TRAINING APPLICATIONS" title="My Applications" description="Follow the status of your program applications." />

      {applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="When you apply for a CodeRise Academy training program, it will appear here."
          actionLabel="Explore Programs"
          actionHref="/programs"
        />
      ) : (
        <div className="student-record-list">
          {applications.map((application) => {
            const open = openId === application.id;
            return (
              <article className="student-record-card application-card" key={application.id}>
                <div className="student-record-icon"><FileText size={23} aria-hidden="true" /></div>
                <div className="student-record-content">
                  <h2>{application.programTitle || "Training program"}</h2>
                  <div className="record-meta">
                    <span><CalendarDays size={15} aria-hidden="true" /> Applied {formatDate(application.submittedAt)}</span>
                    <span>{formatCurrency(getProgramPrice(application))}</span>
                  </div>
                  {application.adminFeedback && (
                    <p className="application-feedback"><strong>Message from the academy:</strong> {application.adminFeedback}</p>
                  )}
                  <button
                    type="button"
                    className="application-toggle"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : application.id)}
                  >
                    {open ? "Hide details" : "View details"} <ChevronDown size={16} aria-hidden="true" className={open ? "rotate-180" : ""} />
                  </button>
                  {open && (
                    <div className="application-details">
                      <dl>
                        <Detail label="Reference" value={application.id} />
                        <Detail label="Full name" value={application.fullName} />
                        <Detail label="Email" value={application.email} />
                        <Detail label="Phone" value={application.phone} />
                        <Detail label="Skill level" value={application.skillLevel} />
                        <Detail label="Preferred contact" value={application.preferredContact} />
                        <Detail label="Learning goals" value={application.learningGoals} />
                        <Detail label="Why you want to join" value={application.reason} />
                        <Detail label="Experience" value={application.experience} />
                      </dl>
                      {Array.isArray(application.history) && application.history.length > 0 && (
                        <>
                          <h3>Status history</h3>
                          <ol className="ui-timeline">
                            {application.history.map((entry) => (
                              <li key={entry.id}>
                                <strong>{entry.toStatus}</strong>
                                <small>{formatDate(entry.createdAt)}</small>
                              </li>
                            ))}
                          </ol>
                        </>
                      )}
                      <p className="muted-text">Approval and payment are separate steps. The academy team will contact you about payment after approval.</p>
                    </div>
                  )}
                </div>
                <StatusBadge status={application.status} />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
