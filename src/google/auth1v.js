import { google }  from 'googleapis';
import crypto from 'crypto';
import express from 'express';
import session from 'express-session';

const app = express();

// Middleware for session handling
app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET, // Change this to a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
  }));
  
  // OAuth 2.0 Client Setup (Replace with your credentials)
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );
  
  // Scopes for YouTube API access
  const scopes = ['https://www.googleapis.com/auth/youtube.force-ssl'];
  
  // Route to start authentication
  app.get('/google', (req, res) => {
    // Generate a secure state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    req.session.state = state; // Store state in session
  
    // Generate OAuth URL
    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
      state: state
    });
  
    res.redirect(authorizationUrl); // Redirect user to Google OAuth
  });
  
  // Route to handle OAuth callback
  app.get('/callback', async (req, res) => {
    const { code, state } = req.query;
  
    // Verify the state matches the stored session value
    if (!code || state !== req.session.state) {
      return res.status(400).send('State mismatch or missing authorization code');
    }
  
    try {
      // Exchange authorization code for access token
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      req.session.tokens = tokens; // Store tokens in session
  
      res.send('Authentication successful! You can now use the YouTube API.');
    } catch (error) {
      console.error('Error exchanging code:', error);
      res.status(500).send('Authentication failed');
    }
  });
  