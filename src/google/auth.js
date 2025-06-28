import { google } from "googleapis";
import crypto from 'crypto';
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";

// Setup OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL // e.g., "http://localhost:8000/auth/google/callback"
);

// Google OAuth2 scopes
const scopes = [
  "https://www.googleapis.com/auth/youtube.upload",
];

const genGoogleURL = asyncHandler(async(req,res)=>{
    const tempToken = req.cookies?.tempToken;
    if(!tempToken){
        throw new APIError(404,"No temp cookie found for invite code generation.");
    }
    const { email } = jwt.verify(tempToken, process.env.TEMP_TOKEN_SECRET); 
  const state = crypto.randomBytes(32).toString('hex');
  // Store state in the session
  req.session.state = state;
  req.session.emailForGoogleLink = email;
  // Generate a url that asks permissions for the Drive activity and Google Calendar scope
  const authorizationUrl = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',

    // prompt: 'consent',
    /** Pass in the scopes array defined above.
      * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
    scope: scopes,
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true,
    // Include the state parameter to reduce the risk of CSRF attacks.
    state: state
  });

  res.redirect(authorizationUrl);
})

export {genGoogleURL,oauth2Client,scopes};