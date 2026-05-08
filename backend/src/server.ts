//imports → setup/constants → state → routes → listen.
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import querystring from "querystring";
import axios from "axios";

import { generateRandomString, reqLimitAndOffsetObj } from "./helpers";
import type { SearchType, userTokenObject } from "./types/types";
import { EN } from "./translations/translations";

dotenv.config();

const app = express();
app.use(cors());

const apiBaseUrl = "https://api.spotify.com/v1";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.REDIRECT_URI!;

const { errorNotAutherised } = EN;

let accessObject: userTokenObject = {
  access_token: "",
  refresh_token: "",
};

app.get("/", (_req, res) => {
  res.redirect("/login");
});

app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
  res.status(204).send();
});

app.get("/login", (_req, res) => {
  const state = generateRandomString(16);
  const scope =
    "user-read-private user-read-email playlist-read-private user-top-read";

  const queryParams = querystring.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
    state,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.get("/callback", async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : null;

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
    accessObject = { access_token, refresh_token };

    res.send("Login successful! Check backend console for tokens.");
  } catch (error: any) {
    console.error("TOKEN ERROR:", error.response?.data || error.message);
    res.status(500).send("Error getting tokens");
  }
});

app.get("/me", async (_req, res) => {
  const { access_token } = accessObject;

  if (!access_token) {
    return res.status(401).json({ error: errorNotAutherised });
  }

  try {
    const result = await axios.get(`${apiBaseUrl}/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    res.json(result.data);
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Error fetching user profile" });
  }
});

app.get("/me/top/:type", async (req, res) => {
  const { access_token } = accessObject;

  if (!access_token) {
    return res.status(401).json({ error: errorNotAutherised });
  }

  try {
    const type = req.params.type;
    const { limit, offset } = reqLimitAndOffsetObj(req);

    if (type !== "tracks" && type !== "artists") {
      return res.status(400).json({ error: "Invalid type supplied" });
    }

    const result = await axios.get(
      `${apiBaseUrl}/me/top/${type}?limit=${limit}&offset=${offset}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );

    res.json(result.data);
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch top items" });
  }
});

app.get("/user/playlists", async (req, res) => {
  const { access_token } = accessObject;

  if (!access_token) {
    return res.status(401).json({ error: errorNotAutherised });
  }

  try {
    const { limit } = reqLimitAndOffsetObj(req);

    const response = await axios.get(
      `${apiBaseUrl}/me/playlists?limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
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

app.get("/search", async (req, res) => {
  const { access_token } = accessObject;

  if (!access_token) {
    return res.status(401).json({ error: errorNotAutherised });
  }

  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (!q) {
      return res.status(400).json({ error: "Missing query parameter `q`" });
    }

    const { limit, offset } = reqLimitAndOffsetObj(req);

    const type: SearchType =
      typeof req.query.type === "string"
        ? (req.query.type as SearchType)
        : "playlist";

    const qs = querystring.stringify({ q, type, limit, offset });

    const response = await axios.get(`${apiBaseUrl}/search?${qs}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("Search error:", error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      error: "Search failed",
    });
  }
});

app.get("/playlist/:id/tracks", async (req, res) => {
  const { access_token } = accessObject;

  if (!access_token) {
    return res.status(401).json({ error: errorNotAutherised });
  }

  try {
    const { limit, offset } = reqLimitAndOffsetObj(req);

    const response = await axios.get(
      `${apiBaseUrl}/playlists/${req.params.id}/tracks?limit=${limit}&offset=${offset}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
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

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});