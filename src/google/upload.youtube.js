import axios from 'axios';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // MongoDB User Model

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

const uploadOnYT = async (req, res) => {
    try {
        // Extract JWT token from cookies
        const accessToken = req.cookies?.accessToken;

        if(!accessToken){
            throw new APIError(404,"No accessToken Cookies");
        }
        // Decode JWT to get user's email
        const decodeToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)    
        const email = decodeToken.email;

        // Find user in MongoDB and get refresh token
        const user = await User.findOne({ email});

        if (!user || !user.googleRefreshToken) {
            return res.status(404).json({ error: 'User not found or missing Google refresh token' });
        }

        // Generate new Google access token from refresh token
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_CLIENT_URL_UPLOAD
        );
        oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });

        // YouTube API client
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

        // Cloudinary video URL
        // const {cloudUrl , title ,description} = req.body;
        const cloudUrl = 'https://res.cloudinary.com/rs14jr/video/upload/v1743518327/3195394-uhd_3840_2160_25fps_lecp8b.mp4'

        if (!cloudUrl) return res.status(400).json({ error: 'Missing Cloudinary video URL' });

        console.log('Streaming video from Cloudinary to YouTube...');

        // Video metadata
        const videoMetadata = {
            snippet: {
                title:'My YouTube Upload via API',
                description:'Uploaded using YouTube API',
                tags: ['Cloudinary', 'YouTube API', 'Streaming Upload'],
                categoryId: '22', // Default: People & Blogs
            },
            status: {
                privacyStatus: 'private',
            },
        };

        // Stream the video directly from Cloudinary to YouTube
        const response = await axios({
            method: 'GET',
            url: cloudUrl,
            responseType: 'stream',
        });

        const uploadResponse = await youtube.videos.insert({
            part: 'snippet,status',
            requestBody: videoMetadata,
            media: {
                body: response.data, // Directly passing the readable stream
            },
        });

        console.log('Video uploaded successfully! Video ID:', uploadResponse.data.id);

        res.status(200).json({ message: 'Upload successful', videoId: uploadResponse.data.id });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ error: 'Failed to upload video', details: error.message });
    }
};

export { uploadOnYT };