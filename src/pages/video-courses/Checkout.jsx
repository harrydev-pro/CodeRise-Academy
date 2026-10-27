import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

import { getVideoCourseById } from "../../features/video-courses/videoCourseService";
import { createPurchase } from "../../features/video-courses/purchaseService";
import { formatCurrency } from "../../utils/formatCurrency";
import { useAuth } from "../../hooks/useAuth";

import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const course = getVideoCourseById(courseId);

  const [accepted, setAccepted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!course || course.published === false) {
    return (
      <main className="page-container">
        <EmptyState
          title="Course not found"
          description="The selected course is not available."
          action={
            <Link to="/video-courses" className="btn btn-primary">
              Browse courses
            </Link>
          }
        />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page-container">
        <EmptyState
          title="Sign in to continue"
          description="You need an account before proceeding with a course purchase."
          action={
            <Link
              to="/login"
              state={{ from: `/video-courses/${courseId}/checkout` }}
              className="btn btn-primary"
            >
              Sign in
            </Link>
          }
        />
      </main>
    );
  }

  const price = Number(course.price) || 0;

  function handlePurchase(event) {
    event.preventDefault();

    if (!accepted) {
      setError("Please acknowledge the demonstration purchase terms.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const purchase = createPurchase({
        userId: user.id,
        userName: user.fullName || user.name || user.email,
        courseId: course.id,
        courseTitle: course.title,
        amount: price,
        currency: "NGN",
        status: "completed",
        paymentMethod: "Demo checkout",
        paymentReference: `DEMO-${Date.now()}`,
        purchasedAt: new Date().toISOString(),
        demo: true,
      });

      navigate(`/video-courses/${course.id}/confirmation`, {
        replace: true,
        state: {
          purchase,
          courseTitle: course.title,
          amount: price,
          demo: true,
        },
      });
    } catch (purchaseError) {
      console.error("Demo purchase failed:", purchaseError);
      setError("The demo purchase could not be saved. Please try again.");
      setProcessing(false);
    }
  }

  return (
    <main className="page-container checkout-page">
      <Link
        to={`/video-courses/${courseId}`}
        className="back-link"
      >
        <ArrowLeft size={17} />
        Back to course
      </Link>

      <section className="checkout-heading">
        <span className="eyebrow">CHECKOUT</span>
        <h1>Review your course purchase</h1>

        <p>
          Check the details below before completing the demonstration
          transaction.
        </p>
      </section>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handlePurchase}>
          <div className="checkout-notice">
            <ShieldCheck size={23} />

            <div>
              <strong>Demo checkout only</strong>
              <p>
                This prototype does not connect to a payment gateway and
                will not charge you.
              </p>
            </div>
          </div>

          <section className="checkout-section">
            <h2>Student information</h2>

            <div className="checkout-user">
              <div className="checkout-avatar">
                {(user.fullName || user.name || user.email || "S")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {user.fullName || user.name || "Student"}
                </strong>
                <span>{user.email}</span>
              </div>
            </div>
          </section>

          <section className="checkout-section">
            <h2>Payment method</h2>

            <div className="demo-payment-method">
              <CreditCard size={23} />

              <div>
                <strong>Demo payment</strong>
                <span>No card details required</span>
              </div>

              <span className="demo-payment-badge">TEST MODE</span>
            </div>
          </section>

          <label className="checkout-consent">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => {
                setAccepted(event.target.checked);
                setError("");
              }}
            />

            <span>
              I understand that this is a demonstration purchase and no
              real payment will be taken.
            </span>
          </label>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <Button
            type="submit"
            loading={processing}
            disabled={!accepted || processing}
            className="full-width"
          >
            Complete demo purchase
          </Button>
        </form>

        <aside className="checkout-summary">
          <h2>Order summary</h2>

          <div className="checkout-course-summary">
            <div className="checkout-course-icon">
              <CheckCircle2 size={23} />
            </div>

            <div>
              <strong>{course.title}</strong>
              <span>Video course</span>
            </div>
          </div>

          <div className="checkout-price-row">
            <span>Course price</span>
            <strong>{formatCurrency(price)}</strong>
          </div>

          <div className="checkout-price-row">
            <span>Discount</span>
            <strong>{formatCurrency(0)}</strong>
          </div>

          <div className="checkout-total">
            <span>Total</span>
            <strong>{formatCurrency(price)}</strong>
          </div>

          <small>
            This summary does not represent a real payment request.
          </small>
        </aside>
      </div>
    </main>
  );
}