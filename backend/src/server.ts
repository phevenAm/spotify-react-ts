// ─────────────────────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────────────────────

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import querystring from "querystring";
import axios from "axios";
import session from "express-session";

import { generateRandomString, reqLimitAndOffsetObj } from "./helpers";
import { EN } from "./translations/translations";

import type { SpotifyApi } from "./types/types";

// ─────────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────────

dotenv.config();

const app = express();

const IS_PROD = process.env.NODE_ENV === "production";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const apiBaseUrl = "https://api.spotify.com/v1";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.REDIRECT_URI!;
const FRONTEND_URL = process.env.FRONTEND_URL!;

const { errorNotAutherised } = EN;

// ─────────────────────────────────────────────────────────────
// SHARED TYPES
// ─────────────────────────────────────────────────────────────

type SearchQuery = {
  q?: string;
  type?: string;
};

type ApiError = {
  message: string;
};

type SearchResponse = SpotifyApi.SearchResponse | ApiError;

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE
// Runs BEFORE routes
// ─────────────────────────────────────────────────────────────

// ---- CORS ----

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5173",
      "http://localhost:5173",
      "https://spotify-react-ts-five.vercel.app",
    ],
    credentials: true,
  }),
);

// ---- SESSION ----

app.use(
  session({
    secret: process.env.SESSION_SECRET!,

    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: IS_PROD ? "none" : "lax",
      maxAge: 1000 * 60 * 60,
    },
  }),
);

// ─────────────────────────────────────────────────────────────
// ROOT ROUTES
// ─────────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.redirect("/login");
});

app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
  res.status(204).send();
});

// ─────────────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────────────

app.get("/login", (_req, res) => {
  const state = generateRandomString(16);
  _req.session.oauth_state = state;

  const scope =
    "user-read-private user-read-email playlist-read-private user-top-read";

  const queryParams = querystring.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
    state,
    show_dialog: true,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

//!After sign in, request access and refresh tokens via callback (callback from spotidy gives a temp code and state.)
app.get("/callback", async (req, res) => {

  const returnedState =
    typeof req.query.state === "string" ? req.query.state : null;

  const storedState = req.session.oauth_state;

  if (!returnedState || returnedState !== storedState) {
    return res.status(400).send("Invalid state");
  }

  const code = typeof req.query.code === "string" ? req.query.code : null;
  if (!code) {
    return res.status(400).send("Missing code parameter");
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",

      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),

      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",

          Authorization:
            "Basic " +
            Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
        },
      },
    );

    const { access_token, refresh_token } = response.data;

    req.session.access_token = access_token;
    req.session.refresh_token = refresh_token;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);

        return res.status(500).send("Session save failed");
      }

      res.redirect(FRONTEND_URL);
    });
  } catch (error: any) {
    console.error("TOKEN ERROR:", error.response?.data || error.message);

    res.status(500).send("Error getting tokens");
  }
});

// ─────────────────────────────────────────────────────────────
// USER ROUTES
// ─────────────────────────────────────────────────────────────

app.get("/me", async (req, res) => {
  const access_token = req.session.access_token;

  if (!access_token) {
    return res.status(401).json({ error: errorNotAutherised });
  }

  try {
    const result = await axios.get(`${apiBaseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    res.json(result.data);
  } catch (error: any) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: "Error fetching user profile",
    });
  }
});

app.get("/me/top/:type", async (req, res) => {
  const access_token = req.session.access_token;

  if (!access_token) {
    return res.status(401).json({ error: errorNotAutherised });
  }

  try {
    const type = req.params.type;

    const { limit, offset } = reqLimitAndOffsetObj(req);

    if (type !== "tracks" && type !== "artists") {
      return res.status(400).json({
        error: "Invalid type supplied",
      });
    }

    const result = await axios.get(
      `${apiBaseUrl}/me/top/${type}?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    res.json(result.data);
  } catch (error: any) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: "Failed to fetch top items",
    });
  }
});

// ─────────────────────────────────────────────────────────────
// PLAYLIST ROUTES
// ─────────────────────────────────────────────────────────────

app.get("/user/playlists", async (req, res) => {
  const access_token = req.session.access_token;

  if (!access_token) {
    return res.status(401).json({ error: errorNotAutherised });
  }

  try {
    const { limit } = reqLimitAndOffsetObj(req);

    const response = await axios.get(
      `${apiBaseUrl}/me/playlists?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    res.json(response.data);
  } catch (error: any) {
    console.error(
      "Error fetching playlists:",
      error.response?.data || error.message,
    );

    res.status(error.response?.status || 500).json({
      error: "Error fetching playlists",
    });
  }
});

app.get("/playlist/:id/tracks", async (req, res) => {
  const access_token = req.session.access_token;

  if (!access_token) {
    return res.status(401).json({ error: errorNotAutherised });
  }

  try {
    const { limit, offset } = reqLimitAndOffsetObj(req);

    const response = await axios.get(
      `${apiBaseUrl}/playlists/${req.params.id}/tracks?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    res.json(response.data);
  } catch (error: any) {
    console.error(
      "Error fetching playlist tracks:",
      error.response?.data || error.message,
    );

    res.status(error.response?.status || 500).json({
      error: "Error fetching playlist tracks",
    });
  }
});

// ─────────────────────────────────────────────────────────────
// SEARCH ROUTES
// ─────────────────────────────────────────────────────────────

app.get<{}, SearchResponse, {}, SearchQuery>(
  "/search",

  async (req, res) => {
    const access_token = req.session.access_token;

    const { q, type } = req.query;

    if (!q || !type) {
      return res.status(400).json({
        message: "Missing search query or type",
      });
    }

    try {
      const response = await axios.get<SpotifyApi.SearchResponse>(
        "https://api.spotify.com/v1/search",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },

          params: {
            q,
            type,
          },
        },
      );

      return res.status(200).json(response.data);
    } catch {
      return res.status(500).json({
        message: "Search failed",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// SERVER
// ─────────────────────────────────────────────────────────────

app.listen(3000, () => {
  console.log("Server is running on http://127.0.0.1:3000");
});
