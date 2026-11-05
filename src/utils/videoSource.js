// Works out how to play a lesson's video link.
//   YouTube / Vimeo links -> embedded player (plays inline on iPhone)
//   direct .mp4 / .webm / .mov files -> native <video> (progress and resume tracked)
export function videoSource(url) {
  if (!url) return { kind: "none" };
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { kind: "none" };
  }
  if (parsed.protocol !== "https:") return { kind: "none" };
  const host = parsed.hostname.replace(/^www\.|^m\./, "");
  let youtubeId = null;
  if (host === "youtu.be") youtubeId = parsed.pathname.slice(1);
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    youtubeId = parsed.searchParams.get("v") || parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] || null;
  }
  if (youtubeId && /^[\w-]{6,20}$/.test(youtubeId)) {
    return { kind: "embed", provider: "YouTube", src: `https://www.youtube-nocookie.com/embed/${youtubeId}?playsinline=1&rel=0&modestbranding=1` };
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const vimeoId = parsed.pathname.match(/(\d{6,12})/)?.[1];
    if (vimeoId) return { kind: "embed", provider: "Vimeo", src: `https://player.vimeo.com/video/${vimeoId}?playsinline=1` };
  }
  if (/\.(mp4|webm|mov|m4v)$/i.test(parsed.pathname)) return { kind: "file", src: parsed.href };
  return { kind: "link", src: parsed.href };
}
