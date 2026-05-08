// src/services/api.ts
// ============================================================
// All HTTP calls to your Express backend live here.
// The frontend NEVER calls Spotify directly — it goes through
// your backend which holds the Bearer token.
//
// Pattern: every function calls fetch(), checks response.ok,
// parses JSON, and throws a typed error if something goes wrong.
// ============================================================

const BASE_URL = 'http://localhost:3000';

// ---- Generic fetch wrapper ----
// Centralises error handling so individual functions stay clean.
async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);

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
  return apiFetch<SpotifyApi.UserProfile>('/user');
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

// ---- Namespace for Spotify response shapes ----
// These mirror what your backend returns from Spotify.
// Expand these as you add more endpoints.
export namespace SpotifyApi {

  export interface UserProfile {
    id: string;
    display_name: string;
    email: string;
    images: Image[];
    followers: { total: number };
    country: string;
    product: string;
  }

  export interface Image {
    url: string;
    height: number;
    width: number;
  }

  export interface PlaylistPage {
    items: Playlist[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
    previous: string | null;
  }

  export interface Playlist {
    id: string;
    name: string;
    description: string;
    images: Image[];
    tracks: { total: number; href: string };
    owner: { display_name: string; id: string };
    public: boolean;
    uri: string;
    external_urls: { spotify: string };
  }

  export interface SearchResponse {
    playlists?: PlaylistPage;
    tracks?: TrackPage;
  }

  export interface TrackPage {
    items: TrackItem[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
    previous: string | null;
  }

  export interface TrackItem {
    track: Track;
    added_at: string;
  }

  export interface Track {
    id: string;
    name: string;
    duration_ms: number;
    artists: Artist[];
    album: Album;
    explicit: boolean;
    uri: string;
    external_urls: { spotify: string };
  }

  export interface Artist {
    id: string;
    name: string;
  }

  export interface Album {
    id: string;
    name: string;
    images: Image[];
    release_date: string;
  }
}
