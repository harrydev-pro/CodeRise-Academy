import { useState } from "react";
import {
  Mail,
  MessageCircle,
  Send,
  CheckCircle2,
} from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { validateEmail } from "../../utils/validators";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSuccess(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Enter your name.";
    }

    if (!validateEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.subject.trim()) {
      nextErrors.subject = "Enter a subject.";
    }

    if (form.message.trim().length < 10) {
      nextErrors.message =
        "Your message must contain at least 10 characters.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    // No email or external message is sent in this prototype.
    setSuccess(true);

    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  }

  return (
    <main>
      <section className="page-hero">
        <div className="container page-hero-content">
          <span className="eyebrow">CONTACT US</span>

          <h1>
            How can we <span>help you?</span>
          </h1>

          <p>
            Have a question about our training programs, free learning
            resources, or registration? Send us a message.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container contact-grid">
          <div className="contact-information">
            <span className="eyebrow">GET IN TOUCH</span>

            <h2>We would like to hear from you.</h2>

            <p>
              Use the contact form to prepare your message. The current
              prototype does not send messages to an email address.
            </p>

            <div className="contact-information-card">
              <span className="contact-information-icon">
                <Mail size={23} />
              </span>

              <div>
                <h3>Email support</h3>

                <p>
                  Connect an official CodeRise Academy email address
                  before publishing the live contact service.
                </p>
              </div>
            </div>

            <div className="contact-information-card">
              <span className="contact-information-icon">
                <MessageCircle size={23} />
              </span>

              <div>
                <h3>Program enquiries</h3>

                <p>
                  You can review program details and prices on our
                  Programs page.
                </p>
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            <h2>Send us a message</h2>

            <p className="form-description">
              Complete the form below.
            </p>

            {success && (
              <div className="alert alert-info">
                <CheckCircle2 size={18} />

                <span>
                  Your message passed validation, but it has not been sent.
                  A backend or email service is required to deliver it.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <Input
                label="Full name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                error={errors.name}
                required
              />

              <Input
                label="Email address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                error={errors.email}
                required
              />

              <Input
                label="Subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="What is your enquiry about?"
                error={errors.subject}
                required
              />

              <div className="form-field">
                <label className="field-label" htmlFor="contactMessage">
                  Message
                </label>

                <textarea
                  id="contactMessage"
                  name="message"
                  className="form-input form-textarea"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message..."
                  rows={5}
                  required
                />

                {errors.message && (
                  <p className="field-error">{errors.message}</p>
                )}
              </div>

              <Button type="submit" fullWidth>
                Submit Message <Send size={17} />
              </Button>

              <p className="form-demo-note">
                Demonstration form: no message is sent or stored remotely.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}