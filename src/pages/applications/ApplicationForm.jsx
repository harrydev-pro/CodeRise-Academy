import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

import { getPrograms } from "../../features/programs/programService";
import { createApplication } from "../../features/applications/applicationService";
import { validateApplication } from "../../features/applications/applicationValidation";

import { formatCurrency } from "../../utils/formatCurrency";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  programId: "",
  skillLevel: "",
  experience: "",
  reason: "",
  preferredContact: "WhatsApp",
  acceptedTerms: false,
};

export default function ApplicationForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { programId: requestedProgramId } = useParams();

  const programs = useMemo(() => {
    return getPrograms().filter((program) => program.published !== false);
  }, []);

  const [form, setForm] = useState({
    ...initialForm,
    fullName: user?.fullName || user?.name || "",
    email: user?.email || "",
    programId: requestedProgramId || "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedProgram = programs.find(
    (program) => program.id === form.programId
  );

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateApplication(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError("Please review the highlighted fields.");
      return;
    }

    if (!user) {
      navigate("/login", {
        state: { from: `/apply/${form.programId}` },
      });

      return;
    }

    if (!selectedProgram) {
      setSubmitError("Please select an available training program.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const application = createApplication({
        userId: user.id,
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),

        programId: selectedProgram.id,
        programTitle: selectedProgram.title,

        duration: selectedProgram.duration || "",
        originalPrice: Number(selectedProgram.originalPrice) || 0,
        promoPrice: Number(selectedProgram.promotionalPrice) || 0,

        skillLevel: form.skillLevel,
        experience: form.experience.trim(),
        reason: form.reason.trim(),
        preferredContact: form.preferredContact,

        acceptedTerms: form.acceptedTerms,
      });

      navigate(`/application-confirmation/${application.id}`, {
        replace: true,
        state: { application },
      });
    } catch (error) {
      console.error("Application submission failed:", error);
      setSubmitError(
        "We couldn't save your application. Please try again."
      );
      setSubmitting(false);
    }
  }

  if (programs.length === 0) {
    return (
      <main className="page-container">
        <EmptyState
          title="No programs available"
          description="There are currently no published training programs to apply for."
          action={
            <Link to="/" className="btn btn-primary">
              Return home
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="page-container application-page">
      <Link to="/programs" className="back-link">
        <ArrowLeft size={17} />
        Browse training programs
      </Link>

      <section className="application-heading">
        <div className="application-heading-icon">
          <GraduationCap size={30} />
        </div>

        <span className="eyebrow">JOIN CODERISE ACADEMY</span>

        <h1>Apply for a training program</h1>

        <p>
          Tell us about yourself and choose the program that matches your
          learning goals.
        </p>
      </section>

      <div className="application-layout">
        <form className="application-form" onSubmit={handleSubmit}>
          <section className="application-form-section">
            <div className="form-section-heading">
              <span>01</span>

              <div>
                <h2>Personal information</h2>
                <p>How can we contact you?</p>
              </div>
            </div>

            <div className="form-grid">
              <Input
                label="Full name"
                name="fullName"
                value={form.fullName}
                onChange={updateField}
                placeholder="Enter your full name"
                error={errors.fullName}
                required
              />

              <Input
                label="Email address"
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="you@example.com"
                error={errors.email}
                required
              />

              <Input
                label="Phone number"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={updateField}
                placeholder="+234..."
                error={errors.phone}
                required
              />

              <div className="form-field">
                <label htmlFor="preferredContact">
                  Preferred contact method *
                </label>

                <select
                  id="preferredContact"
                  name="preferredContact"
                  value={form.preferredContact}
                  onChange={updateField}
                  aria-invalid={Boolean(errors.preferredContact)}
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Phone">Phone call</option>
                  <option value="Email">Email</option>
                </select>

                {errors.preferredContact && (
                  <span className="field-error">
                    {errors.preferredContact}
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className="application-form-section">
            <div className="form-section-heading">
              <span>02</span>

              <div>
                <h2>Choose your program</h2>
                <p>Select the training you want to join.</p>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="programId">Training program *</label>

              <select
                id="programId"
                name="programId"
                value={form.programId}
                onChange={updateField}
                aria-invalid={Boolean(errors.programId)}
                required
              >
                <option value="">Select a program</option>

                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.title}
                  </option>
                ))}
              </select>

              {errors.programId && (
                <span className="field-error">{errors.programId}</span>
              )}
            </div>

            {selectedProgram && (
              <div className="selected-program-card">
                <div className="selected-program-icon">
                  <GraduationCap size={24} />
                </div>

                <div>
                  <strong>{selectedProgram.title}</strong>

                  <p>
                    Duration: {selectedProgram.duration || "To be confirmed"}
                  </p>
                </div>

                <div className="selected-program-price">
                  <strong>
                    {formatCurrency(
                      selectedProgram.promoPrice ??
                        selectedProgram.price ??
                        0
                    )}
                  </strong>

                  {selectedProgram.originalPrice != null && (
                    <del>
                      {formatCurrency(selectedProgram.originalPrice)}
                    </del>
                  )}
                </div>
              </div>
            )}

            <div className="form-field">
              <label htmlFor="skillLevel">Current skill level *</label>

              <select
                id="skillLevel"
                name="skillLevel"
                value={form.skillLevel}
                onChange={updateField}
                aria-invalid={Boolean(errors.skillLevel)}
                required
              >
                <option value="">Select your skill level</option>
                <option value="Complete beginner">Complete beginner</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              {errors.skillLevel && (
                <span className="field-error">{errors.skillLevel}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="experience">
                Previous experience (optional)
              </label>

              <textarea
                id="experience"
                name="experience"
                value={form.experience}
                onChange={updateField}
                rows={3}
                placeholder="Tell us about any relevant skills or projects."
              />
            </div>
          </section>

          <section className="application-form-section">
            <div className="form-section-heading">
              <span>03</span>

              <div>
                <h2>Your learning goals</h2>
                <p>Help us understand why you want to join.</p>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="reason">
                Why do you want to join this program? *
              </label>

              <textarea
                id="reason"
                name="reason"
                value={form.reason}
                onChange={updateField}
                rows={5}
                placeholder="Describe your goals and what you hope to achieve."
                aria-invalid={Boolean(errors.reason)}
                required
              />

              {errors.reason && (
                <span className="field-error">{errors.reason}</span>
              )}
            </div>
          </section>

          <label className="application-terms">
            <input
              type="checkbox"
              name="acceptedTerms"
              checked={form.acceptedTerms}
              onChange={updateField}
            />

            <span>
              I confirm that the information I provided is accurate and
              understand that submitting this form does not guarantee
              admission or complete a payment.
            </span>
          </label>

          {errors.acceptedTerms && (
            <div className="form-error" role="alert">
              {errors.acceptedTerms}
            </div>
          )}

          {submitError && (
            <div className="form-error" role="alert">
              {submitError}
            </div>
          )}

          <Button
            type="submit"
            loading={submitting}
            className="full-width"
          >
            Submit application <ArrowRight size={17} />
          </Button>

          <p className="application-demo-note">
            Demonstration: applications are stored in this browser. This
            form does not send an email or notify an administrator.
          </p>
        </form>

        <aside className="application-sidebar">
          <div className="application-sidebar-card">
            <ShieldCheck size={27} />

            <h2>Before you apply</h2>

            <ul>
              <li>
                <CheckCircle2 size={17} />
                Use accurate contact details.
              </li>

              <li>
                <CheckCircle2 size={17} />
                Select the correct training program.
              </li>

              <li>
                <CheckCircle2 size={17} />
                Explain your learning goals clearly.
              </li>

              <li>
                <CheckCircle2 size={17} />
                Wait for your application status to be updated.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
