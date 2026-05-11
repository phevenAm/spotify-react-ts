// src/services/api.ts
// ============================================================
// All HTTP calls to Express backend live here.
// The frontend NEVER calls Spotify directly — it goes through
// the backend which holds the Bearer token.
//
// Pattern: every function calls fetch(), checks response.ok,
// parses JSON, and throws a typed error if something goes wrong.
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL;

import type{ SpotifyApi} from  "../../../shared/types"

// ---- Generic fetch wrapper ----
// Centralises error handling so individual functions stay clean.
async function apiFetch<T>(path: string): Promise<T> {
const response = await fetch(`${BASE_URL}${path}`, {
  credentials: "include",
});

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ---- Auth ----
export function loginWithSpotify(): void {
  // Redirect the browser to the backend's /login route,
  // which kicks off the Spotify OAuth flow.
  window.location.href = `${BASE_URL}/login`;
}

// ---- User ----
export async function fetchUser() {
  return apiFetch<SpotifyApi.UserProfile>('/me');
}

// ---- Playlists ----
export async function fetchMyPlaylists(limit = 20, offset = 0) {
  return apiFetch<SpotifyApi.PlaylistPage>(`/user/playlists?limit=${limit}&offset=${offset}`);
}

// ---- Search ----
export async function searchPlaylists(q: string, limit = 20, offset = 0) {
  const params = new URLSearchParams({ q, type: 'playlist', limit: String(limit), offset: String(offset) });
  return apiFetch<SpotifyApi.SearchResponse>(`/search?${params}`);
}

// ---- Playlist tracks ----
export async function fetchPlaylistTracks(playlistId: string, limit = 20, offset = 0) {
  return apiFetch<SpotifyApi.TrackPage>(`/playlist/${playlistId}/tracks?limit=${limit}&offset=${offset}`);
}

