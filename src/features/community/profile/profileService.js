import { requestData } from "../../../services/api/dataClient";
import { findSampleProfile } from "./sampleCommunityProfiles";

// S21 Community Profile.
//
// Endpoints (student session):
//   GET    /community/users/:username            -> { profile }   (shape in sampleCommunityProfiles.js)
//   POST   /community/users/:username/follow      (follow)     } both via setFollowing() in
//   DELETE /community/users/:username/follow      (unfollow)   } communityService.js
//   GET    /community/certificates/:id/download   -> { url }  (owner only; a short-lived signed link)
//
// The BACKEND decides what is visible: private projects are never included for other people
// (hiddenPrivateCount is only sent to the owner), certificates can only be downloaded by their
// owner, and `isViewer` comes from the session — the page only shows "Edit profile" when the API
// says it is the viewer's own profile.
//
// On the local dev server a failed request falls back to sample data (isSample: true).

export async function getCommunityProfile({ username }) {
  try {
    const profile = await requestData(`/community/users/${encodeURIComponent(username)}`, "profile");
    if (!profile) throw notFound();
    return { profile, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) {
      const profile = findSampleProfile(username);
      if (!profile) throw notFound(error);
      return { profile: structuredClone(profile), isSample: true };
    }
    if (error.status === 404) throw notFound(error);
    throw error;
  }
}

function notFound(cause) {
  const error = new Error("We couldn't find a community member with that username.", cause ? { cause } : undefined);
  error.code = "not_found";
  return error;
}

export async function getCertificateDownload(id, { sample } = {}) {
  if (sample) {
    await new Promise((resolve) => { window.setTimeout(resolve, 250); });
    return { url: null };
  }
  return requestData(`/community/certificates/${encodeURIComponent(id)}/download`);
}
