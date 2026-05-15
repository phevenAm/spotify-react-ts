// src/services/api.ts
// ============================================================
// All HTTP calls to Express backend live here.
// The frontend NEVER calls Spotify directly — it goes through
// the backend which holds the Bearer token.
// ============================================================

import type { SpotifyApi } from '../../../shared/types';
import { getAccessToken } from './tokenStore';

const BASE_URL = import.meta.env.VITE_API_URL;

export type SearchType = 'track' | 'playlist';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Attach the Bearer token when we have one so the backend can
  // authenticate the request without relying on a cross-site cookie.
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ---- Auth ----
export function loginWithSpotify(): void {
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

// ---- Generic Spotify search ----
export async function searchSpotify(
  q: string,
  type: SearchType,
  limit = 20,
  offset = 0,
) {
  const params = new URLSearchParams({
    q: q.trim(),
    type,
    limit: String(limit),
    offset: String(offset),
  });

  return apiFetch<SpotifyApi.SearchResponse>(`/search?${params.toString()}`);
}

// ---- Search playlists ----
export async function searchPlaylists(
  q: string,
  limit = 20,
  offset = 0,
) {
  return searchSpotify(q, 'playlist', limit, offset);
}

// ---- Playlist tracks ----
export async function fetchPlaylistTracks(playlistId: string, limit = 20, offset = 0) {
  return apiFetch<SpotifyApi.TrackPage>(`/playlist/${playlistId}/tracks?limit=${limit}&offset=${offset}`);
}

export type { SpotifyApi };
