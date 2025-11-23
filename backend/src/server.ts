import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import querystring from 'querystring';
import axios from 'axios'
import { generateRandomString } from './helpers';


dotenv.config();
const app = express();
app.use(cors());

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

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});


app.get('/authorize', (_req, res) => {
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email playlist-read-private';
  const queryParams = querystring.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
    state,
  });

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
    console.log('ACCESS TOKEN:', access_token);
    console.log('REFRESH TOKEN:', refresh_token);

    res.send('Login successful! Check backend console for tokens.');
  } catch (error) {
    console.error(error);
    res.send('Error getting tokens');
  }
});
