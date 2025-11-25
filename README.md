# spotify-react-ts
spotify-mood-app



PROJECT SUMMARY — “Moodify” (Mood-Based Spotify Companion App)
Core Concept

A web app that layers mood-driven, personalized music discovery on top of the official Spotify API.
User picks a mood → app fetches curated playlists + AI-generated recommendations → user listens via Spotify.

Not a Spotify clone. A mood engine on top of Spotify.

Core Features
1. Mood Selection System

User chooses a mood (Calm, Angry, Energetic, Romantic, Focused, etc.)

Can use emojis or animated UI elements.

Selecting a mood triggers:

Spotify playlist suggestions

Optional AI recommendation generation

Mood-themed UI color changes / animations

2. Curated Playlists (Spotify API)

Based on mood → fetch:

Featured playlists

Genre playlists

User’s personal playlists matching vibe

Needs Spotify OAuth access token

Use /browse/categories, /search, /recommendations

3. AI-Generated Recommendations

Feed:

user’s mood

user’s playback history

previously liked mood lists

Output:

track list

mood descriptors

maybe a short description of why it fits

This is optional but adds flavor beyond raw Spotify data.

4. User Mood History

Store:

mood selections

time of day

playlists listened to

skipped vs. played tracks

Provide:

charts

weekly vibe summary

“Your Most Frequent Moods”

Simple table + timestamps is enough for MVP.

5. Visuals / Themes / Animations

Each mood triggers:

gradient themes

subtle background animations

emoji or icon transformation

Keep the UI clean, modern, high-contrast.

Nothing tacky.

Technical Structure
Frontend (React + TS)

Mood selection UI

Playlist display

User mood history dashboard

Themed UI system

Backend (Node/Express + TS)

/authorize and /callback for Spotify OAuth

Endpoint to refresh tokens

Endpoint to fetch mood-filtered playlists

Optional AI endpoint for enhanced suggestions

Auth Flow (Already Started)

User clicks “Login with Spotify”

Redirects to Spotify OAuth authorize URL

Spotify sends back a code to /callback

Backend exchanges it for access + refresh tokens

Frontend stores access token in memory (NOT localStorage for security)

MVP First Steps

Finish Spotify OAuth

Build mood selector UI

Fetch playlists based on mood

Display playlists cleanly

Log mood selections locally

Add AI recommendations later