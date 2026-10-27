import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  ReceiptText,
} from "lucide-react";

import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

export default function PurchaseConfirmation() {
  const { courseId } = useParams();
  const location = useLocation();

  const purchase = location.state?.purchase;
  const courseTitle =
    location.state?.courseTitle || purchase?.courseTitle || "Video course";

  const amount =
    location.state?.amount ?? purchase?.amount ?? 0;

  const purchasedAt =
    purchase?.purchasedAt || new Date().toISOString();

  return (
    <main className="page-container purchase-confirmation-page">
      <section className="purchase-success-card">
        <div className="purchase-success-icon">
          <CheckCircle2 size={40} />
        </div>

        <span className="eyebrow">DEMO TRANSACTION</span>

        <h1>Purchase confirmation</h1>

        <p>
          Your demonstration purchase has been recorded in this browser.
          No real payment was processed.
        </p>

        <div className="purchase-confirmation-details">
          <div>
            <span>Course</span>
            <strong>{courseTitle}</strong>
          </div>

          <div>
            <span>Amount</span>
            <strong>{formatCurrency(amount)}</strong>
          </div>

          <div>
            <span>Transaction reference</span>
            <strong>
              {purchase?.paymentReference || "DEMO-PREVIEW"}
            </strong>
          </div>

          <div>
            <span>Date</span>
            <strong>{formatDate(purchasedAt)}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong className="status-badge status-success">
              Demonstration complete
            </strong>
          </div>
        </div>

        {!purchase && (
          <div className="inline-message">
            The confirmation details were not passed from checkout. This
            page is displaying a preview, not proof of a saved purchase.
          </div>
        )}

        <div className="purchase-confirmation-actions">
          <Link
            to={`/video-courses/${courseId}/learn`}
            className="btn btn-primary"
          >
            <GraduationCap size={18} />
            Go to course
            <ArrowRight size={17} />
          </Link>

          <Link
            to="/my-purchases"
            className="btn btn-outline"
          >
            <ReceiptText size={18} />
            Purchase history
          </Link>
        </div>
      </section>
    </main>
  );
}