import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "coderise-pwa-install-dismissed-until";
const LATER_DAYS = 7;

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIOSInstallBrowser() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
}

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) return undefined;

    let timer;
    const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedUntil > Date.now()) return undefined;

    const showIfAllowed = () => {
      if (document.visibilityState !== "visible") return;
      timer = window.setTimeout(() => setVisible(true), 5000);
    };

    const onBeforeInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      showIfAllowed();
    };
    const onInstalled = () => {
      setVisible(false);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    if (isIOSInstallBrowser()) {
      setIosHelp(true);
      showIfAllowed();
    }

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function later() {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + LATER_DAYS * 24 * 60 * 60 * 1000));
    setVisible(false);
  }

  async function install() {
    if (iosHelp && !installPrompt) {
      setVisible(false);
      return;
    }
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    if (choice.outcome === "accepted") setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside className="pwa-install-prompt" role="region" aria-label="Install CodeRise Academy">
      <div className="pwa-install-copy">
        <strong>Install </strong>
        <p>{iosHelp && !installPrompt ? "Use Share, then Add to Home Screen to install the app." : "Add the app to your home screen for quick access."}</p>
      </div>
      <div className="pwa-install-actions">
        <button type="button" className="pwa-later" onClick={later}>Later</button>
        <button type="button" className="pwa-install" onClick={install} aria-label={iosHelp && !installPrompt ? "Got it" : "Install app"}>
          <Download size={16} aria-hidden="true" /> {iosHelp && !installPrompt ? "Got it" : "Install"}
        </button>
        <button type="button" className="pwa-dismiss" onClick={later} aria-label="Dismiss install prompt"><X size={18} aria-hidden="true" /></button>
      </div>
    </aside>
  );
}
