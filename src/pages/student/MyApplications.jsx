import { FileText, CalendarDays } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import { useApiResource } from "../../hooks/useApiResource";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";

export default function MyApplications() {
  const { data: applications, loading, error, reload } = useApiResource("/applications/me", "applications");

  if (loading) return <div className="student-page"><Loader label="Loading your applications…" /></div>;
  if (error) return <div className="student-page"><ErrorMessage message={error} onRetry={reload} /></div>;

  if (applications.length === 0) {
    return (
      <div className="student-page">
        <div className="student-page-heading">
          <h1>My Applications</h1>
          <p>Track your training program applications.</p>
        </div>

        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="When you apply for a CodeRise Academy training program, it will appear here."
          actionLabel="Explore Programs"
          actionHref="/programs"
        />
      </div>
    );
  }

  return (
    <div className="student-page">
      <div className="student-page-heading">
        <span className="eyebrow">TRAINING APPLICATIONS</span>
        <h1>My Applications</h1>
        <p>Review your submitted applications and their statuses.</p>
      </div>

      <div className="student-record-list">
        {applications.map((application) => (
          <article
            className="student-record-card"
            key={application.id}
          >
            <div className="student-record-icon">
              <FileText size={23} />
            </div>

            <div className="student-record-content">
              <h2>{application.programTitle || "Training program"}</h2>

              <p>
                Application reference: {application.id}
              </p>

              <div className="record-meta">
                <span>
                  <CalendarDays size={15} />
                  {formatDate(application.submittedAt || application.createdAt)}
                </span>

                <span>
                  {formatCurrency(
                    Number(application.promotionalPrice ?? application.promoPrice ?? application.originalPrice) || 0
                  )}
                </span>
              </div>
            </div>

            <span
              className={`status-badge status-${String(
                application.status || "pending"
              )
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              {application.status || "Pending"}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
