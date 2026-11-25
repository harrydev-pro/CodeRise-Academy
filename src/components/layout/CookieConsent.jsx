import { useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "coderise-cookie-consent-v1";

export default function CookieConsent() {
  const [visible, setVisible] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === null;
    } catch {
      return true;
    }
  });

  function choose(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } finally {
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <section className="cookie-consent" role="region" aria-label="Cookie preferences" aria-describedby="cookie-consent-description">
      <div className="cookie-consent-copy">
        <h2>We value your privacy</h2>
        <p id="cookie-consent-description">
          CodeRise Academy uses essential cookies for sign-in and security. With your permission, we may also use optional cookies to understand and improve the site. <Link to="/privacy">Read our privacy policy</Link>.
        </p>
      </div>
      <div className="cookie-consent-actions">
        <button type="button" className="cookie-consent-reject" onClick={() => choose("rejected")}>Reject </button>
        <button type="button" className="cookie-consent-accept" onClick={() => choose("accepted")}>Accept </button>
      </div>
    </section>
  );
}
