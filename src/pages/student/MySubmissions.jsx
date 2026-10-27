import { FileCheck2, CalendarDays } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import { useAuth } from "../../hooks/useAuth";
import { readStore } from "../../services/storage/storageAdapter";
import { STORAGE_KEYS } from "../../services/storage/storageKeys";
import { formatDate } from "../../utils/formatDate";

export default function MySubmissions() {
  const { user } = useAuth();

  const submissions = readStore(
    STORAGE_KEYS.submissions,
    []
  )
    .filter((submission) => submission.userId === user?.id)
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
    );

  if (submissions.length === 0) {
    return (
      <div className="student-page">
        <div className="student-page-heading">
          <h1>My Submissions</h1>
          <p>Review the practical projects you have submitted.</p>
        </div>

        <EmptyState
          icon={FileCheck2}
          title="No project submissions"
          description="Your practical project submissions will appear here."
          actionLabel="Explore Free Learning"
          actionHref="/free-learning"
        />
      </div>
    );
  }

  return (
    <div className="student-page">
      <div className="student-page-heading">
        <span className="eyebrow">PRACTICAL WORK</span>
        <h1>My Submissions</h1>
        <p>Track your submitted projects and feedback.</p>
      </div>

      <div className="student-record-list">
        {submissions.map((submission) => (
          <article className="student-record-card" key={submission.id}>
            <div className="student-record-icon">
              <FileCheck2 size={23} />
            </div>

            <div className="student-record-content">
              <h2>
                {submission.projectTitle ||
                  submission.title ||
                  "Practical project"}
              </h2>

              <p>
                {submission.feedback ||
                  "Feedback has not been added yet."}
              </p>

              <div className="record-meta">
                <span>
                  <CalendarDays size={15} />
                  {formatDate(
                    submission.updatedAt || submission.createdAt
                  )}
                </span>

                {submission.score !== undefined &&
                  submission.score !== null && (
                    <span>
                      Score: {submission.score}
                    </span>
                  )}
              </div>
            </div>

            <span className="status-badge">
              {submission.status || "Submitted"}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
