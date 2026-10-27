export function validateApplication(values) {
  const errors = {};

  if (!values.fullName?.trim()) {
    errors.fullName = "Please enter your full name.";
  } else if (values.fullName.trim().length < 3) {
    errors.fullName = "Your name must contain at least 3 characters.";
  }

  if (!values.email?.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.phone?.trim()) {
    errors.phone = "Please enter your phone number.";
  } else if (!/^\+?[\d\s()-]{7,20}$/.test(values.phone.trim())) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!values.programId) {
    errors.programId = "Please select a training program.";
  }

  if (!values.skillLevel) {
    errors.skillLevel = "Please select your current skill level.";
  }

  if (!values.reason?.trim()) {
    errors.reason = "Please explain why you want to join.";
  } else if (values.reason.trim().length < 20) {
    errors.reason = "Please write at least 20 characters.";
  }

  if (!values.preferredContact) {
    errors.preferredContact = "Please choose a contact method.";
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms = "You must accept the application terms.";
  }

  return errors;
}