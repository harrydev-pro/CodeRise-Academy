import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";

import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

import { useApiResource } from "../../hooks/useApiResource";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";

export default function ApplicationConfirmation() {
  const { applicationId } = useParams();
  const location = useLocation();
  const applicationResource = useApiResource("/applications/me", "applications", undefined, Boolean(applicationId && !location.state?.application));
  const application = location.state?.application || applicationResource.data.find((item) => item.id === applicationId);

  if (applicationResource.loading) return <main className="page-container"><Loader label="Loading application…" /></main>;
  if (applicationResource.error) return <main className="page-container"><ErrorMessage message={applicationResource.error} onRetry={applicationResource.reload} /></main>;

  if (!application) {
    return (
      <main className="page-container">
        <section className="empty-state">
          <h1>Application not found</h1>

          <p>
            We couldn't find this application in your account. It may have been removed.
          </p>

          <Link to="/programs" className="btn btn-primary">
            Browse programs
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-container application-confirmation-page">
      <section className="application-confirmation-card">
        <div className="application-confirmation-icon">
          <CheckCircle2 size={42} />
        </div>

        <span className="eyebrow">APPLICATION SUBMITTED</span>

        <h1>Thank you for applying!</h1>

        <p>
          Your application has been saved to your account.
          Its current status is <strong>{application.status || "Pending"}</strong>.
        </p>

        <div className="application-confirmation-reference">
          <ClipboardCheck size={22} />

          <div>
            <span>Application reference</span>
            <strong>{application.id}</strong>
          </div>
        </div>

        <div className="application-confirmation-details">
          <div>
            <span>Applicant</span>
            <strong>{application.fullName}</strong>
          </div>

          <div>
            <span>Program</span>
            <strong>{application.programTitle}</strong>
          </div>

          <div>
            <span>Duration</span>
            <strong>{application.duration || "To be confirmed"}</strong>
          </div>

          <div>
            <span>Program price</span>
            <strong>
              {formatCurrency(application.promoPrice ?? 0)}
            </strong>
          </div>

          <div>
            <span>Date submitted</span>
            <strong>{formatDate(application.submittedAt)}</strong>
          </div>
        </div>

        <div className="application-confirmation-notice">
          <GraduationCap size={23} />

          <div>
            <strong>What happens next?</strong>

            <p>
              The academy team will review your application. Status updates will appear in your notifications.
            </p>
          </div>
        </div>

        <div className="application-confirmation-actions">
          <Link to="/my-applications" className="btn btn-primary">
            View my applications <ArrowRight size={17} />
          </Link>

          <Link to="/programs" className="btn btn-outline">
            Explore other programs
          </Link>
        </div>
      </section>
    </main>
  );
}
