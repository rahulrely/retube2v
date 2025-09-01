import { google } from "googleapis";
import { oauth2Client } from "../google/auth.js";

/**
 * Retrieves the authenticated user's YouTube channel URL.
 * @param {string} googleRefreshToken The OAuth 2.0 refresh token for the user.
 * @returns {Promise<string|null>} The user's channel URL, or null if not found.
 */
async function getUserChannelUrl(googleRefreshToken) {
try {
    // Generate new Google access token from refresh token
    oauth2Client.setCredentials({ refresh_token: googleRefreshToken});

    // Initialize the YouTube Data API client
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // Make an API call to get the authenticated user's channel info
    const response = await youtube.channels.list({
    part: 'snippet',
    mine: true,
    });

    // Check if any channel data was returned
    if (response.data.items && response.data.items.length > 0) {
    const channel = response.data.items[0];
    const channelId = channel.id;

    // Construct the channel URL using the channel ID
    const channelUrl = `https://www.youtube.com/channel/${channelId}`;
    console.log(`User's Channel URL: ${channelUrl}`);
    
    return channelId;
    } else {
    console.log('No channel found for the authenticated user.');
    return null;
    }
} catch (error) {
    console.error('Error fetching user channel:', error);
    return null;
    }
}
export {
    getUserChannelUrl
};