import {
  validateEmail,
  validatePhone,
} from "../../utils/validators";

export function validateRegistration(form) {
  const errors = {};

  if (!String(form.fullName ?? '').trim()) {
    errors.fullName = "Enter your full name.";
  }

  if (!validateEmail(form.email ?? "")) {
    errors.email = "Enter a valid email address.";
  }

  if (!validatePhone(form.phone ?? "")) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!String(form.password ?? '').trim() || String(form.password).length < 8) {
    errors.password = "Your password must contain at least 8 characters.";
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Your passwords do not match.";
  }

  if (!form.acceptTerms) {
    errors.acceptTerms = "You must accept the terms before registering.";
  }

  return errors;
}

export function validateLogin(form) {
  const errors = {};

  if (!validateEmail(form.email ?? "")) {
    errors.email = "Enter a valid email address.";
  }

  if (!String(form.password ?? '').trim()) {
    errors.password = "Enter your password.";
  }

  return errors;
}
