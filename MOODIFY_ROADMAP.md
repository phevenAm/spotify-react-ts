# Moodify — Mood-Based Spotify Companion App

## Project Overview
A web app that layers mood-driven music discovery on top of the official Spotify API.

**User flow:** Pick a mood → fetch curated Spotify playlists → listen via Spotify.

---

## Core Features

### 1. Mood Selection System
- User chooses mood: Calm, Angry, Energetic, Romantic, Focused, etc.
- UI with emojis or animated elements
- Selecting a mood triggers:
  - Spotify playlist suggestions
  - Optional AI recommendation generation
  - Mood-themed UI color changes / animations

### 2. Curated Playlists (Spotify API)
- Fetch based on mood:
  - Featured playlists
  - Genre playlists
  - User's personal playlists matching vibe
- Uses Spotify API endpoints: `/browse/categories`, `/search`, `/recommendations`

### 3. AI-Generated Recommendations (Optional, Phase 2+)
- Input: user mood + playback history + previously liked lists
- Output: track list + mood descriptors + brief description

### 4. User Mood History
- Store: mood selections, time of day, playlists listened to, skipped vs played tracks
- Display: charts, weekly vibe summary, "Your Most Frequent Moods"
- MVP: Simple table + timestamps

### 5. Visuals / Themes / Animations
- Each mood triggers gradient themes, subtle animations, emoji/icon transforms
- Keep UI clean, modern, high-contrast. No tacky designs.

---

## Technical Structure

### Frontend (React + TypeScript)
- Mood selection UI
- Playlist display grid
- User mood history dashboard
- Themed UI system (colors, animations)

### Backend (Node/Express + TypeScript)
- Spotify OAuth (`/login`, `/callback`)
- Token refresh endpoint
- Mood-filtered playlist endpoint
- Optional AI endpoint

---

## Authentication Flow (MVP)

1. User clicks "Login with Spotify"
2. Backend redirects to Spotify OAuth authorize URL
3. User authorizes on Spotify
4. Spotify redirects to `/callback` with a code
5. Backend exchanges code for `access_token` + `refresh_token`
6. Backend stores tokens securely
7. Frontend receives user info (name, profile pic, etc.)
8. Frontend shows mood selector

---

## Development Phases

### Phase 1 — Backend Foundation
- [ ] Store access tokens securely (session/cookie or in-memory for MVP)
- [ ] `/api/user` endpoint — return current user's Spotify profile
- [ ] `/api/playlists?mood=<mood>` endpoint — search Spotify for mood-based playlists
- [ ] `/api/refresh-token` endpoint — refresh expired tokens
- [ ] Error handling for all endpoints

### Phase 2 — Frontend UI
- [ ] React page structure (login → mood selector → playlist view)
- [ ] Login button calling backend `/login`
- [ ] Mood selector (buttons/cards: Calm, Energetic, Romantic, etc.)
- [ ] Fetch playlists when mood clicked
- [ ] Playlist grid display
- [ ] Drag and drop functionality
- [ ] Store mood selections in localStorage (for history)

### Phase 3 — Polish & Features
- [ ] Theme system (colors, gradients per mood)
- [ ] Mood history dashboard + charts
- [ ] AI recommendations integration (optional)
- [ ] Playback controls (play/pause/skip via Spotify API)
- [ ] Animations & micro-interactions

---

## MVP First Steps (Start Here)

1. ✅ Finish Spotify OAuth (backend working)
2. ⬜ Build `/api/user` endpoint (get current user profile)
3. ⬜ Build `/api/playlists` endpoint (fetch mood-based playlists)
4. ⬜ Build mood selector React UI
5. ⬜ Display fetched playlists
6. ⬜ Store mood selections locally

---

## Key Files

### Backend
- `backend/src/server.ts` — main Express app
- `backend/src/helpers/index.ts` — utility functions (random string generator, etc.)
- `backend/.env` — Spotify credentials (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, REDIRECT_URI)
- `backend/package.json` — dependencies, dev script

### Frontend
- `frontend/src/main.tsx` — React entry point
- `frontend/src/App.tsx` — main app component (to build)
- `frontend/src/pages/` — login, mood selector, playlist view (to create)
- `frontend/src/components/` — reusable UI components (to create)
- `frontend/src/styles/` — theme system, mood colors (to create)

---

## Spotify API Resources

- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api)
- Relevant endpoints:
  - `GET /v1/me` — current user profile
  - `GET /v1/browse/categories` — mood categories
  - `GET /v1/search` — search playlists/tracks
  - `GET /v1/recommendations` — get recommendations based on seeds
  - `POST /v1/auth/refresh` — refresh access token (handled by backend)

---

## Notes

- **Security:** Store access tokens in memory or secure HTTP-only cookies. Never expose in localStorage or frontend.
- **Rate limiting:** Spotify API has rate limits (~60 req/min per user). Plan accordingly.
- **Token refresh:** Tokens expire in ~1 hour. Use refresh_token to get a new one automatically.
- **Learning goal:** This is a learning exercise. Focus on understanding OAuth flow, API integration, and React state management. Start simple, iterate.

