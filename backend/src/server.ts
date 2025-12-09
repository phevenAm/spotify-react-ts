import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import querystring from 'querystring';
import axios from 'axios'
import { generateRandomString, reqLimitAndOffsetObj } from './helpers';
import { userTokenObject } from './types/types';
import { EN } from './translations/translations';


let accessObject: userTokenObject = { access_token: '', refresh_token: '' }
dotenv.config();
const app = express();
app.use(cors());

const { errorNotAutherised } = EN;

// Provide a root route so visiting http://localhost:3000/ doesn't 404
app.get('/', (_req, res) => {
  res.redirect('/login');
});

// Some browsers/devtools probe a well-known path; respond with no content
// to avoid 404 noise and CSP/connect attempts from extensions.
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
  res.status(204).send();
});

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.REDIRECT_URI!;

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});


app.get('/login', (_req, res) => {
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email playlist-read-private';
  const queryParams = querystring.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
    state,
  });

  console.log('Redirecting to Spotify authorize URL:', `https://accounts.spotify.com/authorize?${queryParams}`);
  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});



app.get('/callback', async (req, res) => {
  const code = typeof req.query.code === 'string' ? req.query.code : null;

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
        }
      }
    );

    const { access_token, refresh_token } = response.data;
    accessObject = { access_token, refresh_token }
    console.log('ACCESS TOKEN:', access_token);
    console.log('REFRESH TOKEN:', refresh_token);

    res.send('Login successful! Check backend console for tokens.');
  } catch (error) {
    console.error(error);
    res.send('Error getting tokens');
  }
});


const apiBaseUrl = 'https://api.spotify.com/v1';

app.get('/user', async (_req, res) => {
  const { access_token } = accessObject;

  if (!access_token) {
    return res.status(401).json({ error: errorNotAutherised });
  }

  try {
    const response = await axios.get(`${apiBaseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    res.json(response.data);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching user data' });
  }
});

app.get('/user/playlists', async (req, res) => {
  const { access_token } = accessObject;
  if (!access_token) {
    return res.status(401).json({ error: errorNotAutherised });
  }

  // parse limit from query string (default 50, clamp 1..50)
  // const rawLimit = req.query.limit;
  // const limit = typeof rawLimit === 'string' && rawLimit.trim() !== '' ? Math.max(1, Math.min(50, parseInt(rawLimit, 10) || 50)) : 50;
  const { limit } = reqLimitAndOffsetObj(req);

  try {
    // Fetch current user's playlists
    const response = await axios.get(`${apiBaseUrl}/me/playlists?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    res.json(response.data);
  } catch (error) {
    const err: any = error;
    console.error('Error fetching playlists:', err.response?.data || err.message || err);
    const status = err.response?.status || 500;
    res.status(status).json({ error: 'Error fetching playlists' });
  }
});

app.get('/search', async (req, res) => {
  const { access_token } = accessObject;

  if (!access_token) {
    return res.status(401).json({ error: errorNotAutherised })
  }

  try {
    // Read query parameters from the incoming request
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q) return res.status(400).json({ error: 'Missing query parameter `q`' });

    const { limit, offset } = reqLimitAndOffsetObj(req);

    const type = typeof req.query.type === 'string' && req.query.type.trim() !== '' ? req.query.type : 'playlist';
    const qs = querystring.stringify({ q, type, limit, offset });
    const url = `${apiBaseUrl}/search?${qs}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    // return the playlists (Spotify wraps results in .playlists when type=playlist)
    res.json(response.data);
  } catch (error) {
    const err: any = error;
    console.error('Search error:', err.response?.data || err.message || err);
    const status = err.response?.status || 500;
    res.status(status).json({ error: 'Search failed' });
  }
})

app.get('/playlist/:id/tracks', async (req, res) => {
  const { access_token } = accessObject;

  if (!access_token) {
    return res.status(401).json({ error: errorNotAutherised })
  }


  try {

    const { limit, offset } = reqLimitAndOffsetObj(req);
    const url = `${apiBaseUrl}/playlists/${req.params.id}/tracks?limit=${limit}&offset=${offset}`;


    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })

    return res.json(response.data);

  } catch (error) {
    const err: any = error;
    console.error('Error fetching playlist tracks:', err.response?.data || err.message || error);
    const status = err.response?.status || 500;
    res.status(status).json({ error: 'Error fetching playlist tracks' });
  }


})