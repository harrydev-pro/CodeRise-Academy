import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";

import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

import { getApplicationById } from "../../features/applications/applicationService";

export default function ApplicationConfirmation() {
  const { applicationId } = useParams();
  const location = useLocation();

  const application =
    location.state?.application ||
    getApplicationById(applicationId);

  if (!application) {
    return (
      <main className="page-container">
        <section className="empty-state">
          <h1>Application not found</h1>

          <p>
            We couldn't find the application in this browser. It may have
            been submitted in a different browser or session.
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
          Your application has been recorded in this browser demonstration.
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
              In a live system, the academy team would review your application
              and contact you using your preferred contact method. This
              demonstration does not send notifications or messages.
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