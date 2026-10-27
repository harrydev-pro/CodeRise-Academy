import { useMemo } from "react";
import { FileText, CalendarDays } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import { useAuth } from "../../hooks/useAuth";
import { readStore } from "../../services/storage/storageAdapter";
import { STORAGE_KEYS } from "../../services/storage/storageKeys";
import { getPrograms } from "../../features/programs/programService";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";

export default function MyApplications() {
  const { user } = useAuth();

  const applications = useMemo(() => {
    const allApplications = readStore(
      STORAGE_KEYS.applications,
      []
    );

    return allApplications
      .filter((application) => application.userId === user?.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
  }, [user?.id]);

  const programs = getPrograms();

  function getProgramName(application) {
    return (
      programs.find((program) => program.id === application.programId)
        ?.title ||
      application.programTitle || application.programName ||
      "Training program"
    );
  }

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
              <h2>{getProgramName(application)}</h2>

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
                    Number(application.promoPrice ?? application.price) || 0
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
