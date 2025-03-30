import { google } from "googleapis";

// Setup OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL // e.g., "http://localhost:5000/auth/google/callback"
);

// Google OAuth2 scopes
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube",
];

export const getAuthURL = () => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline", // To get refresh token
    scope: SCOPES,
    prompt: "consent", // Always ask for consent
  });
};

export const getGoogleOAuthClient = () => oauth2Client;