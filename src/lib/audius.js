"use client";

// ---------------------------------------------------------------------------
// Audius integration — a legal, free, key-less music API of real artist tracks.
// Flow: (1) discover a live host from the Audius network, (2) search tracks,
// (3) build a streamable MP3 URL for the chosen track.
// Docs: https://docs.audius.org/developers/api/
// ---------------------------------------------------------------------------

const APP_NAME = "offcampus";
let cachedHost = null;

// Pick a working Audius discovery node. The network publishes the current list;
// we grab one and cache it for the session.
export async function getAudiusHost() {
  if (cachedHost) return cachedHost;
  try {
    const res = await fetch("https://api.audius.co");
    const data = await res.json();
    const hosts = data?.data || [];
    if (hosts.length) {
      cachedHost = hosts[Math.floor(Math.random() * hosts.length)];
      return cachedHost;
    }
  } catch {}
  // Fallback host if discovery fails
  cachedHost = "https://discoveryprovider.audius.co";
  return cachedHost;
}

// Search tracks by keyword. Returns a normalized list.
export async function searchAudius(query) {
  const q = (query || "").trim();
  if (!q) return [];
  const host = await getAudiusHost();
  try {
    const res = await fetch(`${host}/v1/tracks/search?query=${encodeURIComponent(q)}&app_name=${APP_NAME}`);
    const data = await res.json();
    const tracks = (data?.data || []).slice(0, 20);
    return tracks
      .filter((t) => t.is_streamable !== false && !t.is_delete)
      .map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.user?.name || t.user?.handle || "Unknown",
        artwork: t.artwork?.["150x150"] || t.artwork?.["480x480"] || null,
        duration: t.duration,
        // stream URL is resolved lazily on select (below)
      }));
  } catch {
    return null; // null = network/API error (distinct from empty results)
  }
}

// Trending tracks — a good default before the user searches.
export async function trendingAudius() {
  const host = await getAudiusHost();
  try {
    const res = await fetch(`${host}/v1/tracks/trending?app_name=${APP_NAME}`);
    const data = await res.json();
    return (data?.data || [])
      .slice(0, 20)
      .filter((t) => t.is_streamable !== false && !t.is_delete)
      .map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.user?.name || t.user?.handle || "Unknown",
        artwork: t.artwork?.["150x150"] || null,
        duration: t.duration,
      }));
  } catch {
    return null;
  }
}

// Build the streamable MP3 URL for a track id.
export async function audiusStreamUrl(trackId) {
  const host = await getAudiusHost();
  return `${host}/v1/tracks/${trackId}/stream?app_name=${APP_NAME}`;
}
