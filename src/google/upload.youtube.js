import axios from "axios";
import { google } from "googleapis";
import dotenv from "dotenv";
import Video from "../models/video.model.js"; // MongoDB Video Model
import { APIError } from "../utils/APIError.js";
import { deleteVideoFromCloudinary } from "../utils/cloundinary.js";
import { APIResponse } from "../utils/APIResponse.js";
import { oauth2Client } from "../google/auth.js";

dotenv.config();

const uploadOnYT = async (req, res) => {
  try {
    const { vid } = req?.query;

    if (!vid) {
      throw new APIError(404, "Video ID not provided in request.");
    }

    const video = await Video.findOne({ vid });
    if (!video) {
      throw new APIError(404, "Video Not Found in DB");
    }

    const user = req?.user;
    if (!user) {
      throw new APIError(404, "User Not Found through Middleware");
    }

    if (video.approver !== user.email) {
      throw new APIError(
        403,
        "Forbidden: You are not allowed to upload this video."
      );
    }

    let { title, description, tags, categoryId } = req.body;

    title = title && title.trim() !== "" ? title : video.title;
    description =
      description && description.trim() !== ""
        ? description
        : video.description;
    categoryId = categoryId && categoryId.trim() !== "" ? categoryId : "22";
    tags = Array.isArray(tags) ? tags : video.tags;

    if (!user || !user.googleRefreshToken) {
      return res
        .status(404)
        .json(
          new APIError(404, "User not found or missing Google refresh token")
        );
    }

    // Generate new Google access token from refresh token
    oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });

    // YouTube API client
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const cloudUrl = video.filePath; // url from video model of cloud

    if (!cloudUrl)
      return res
        .status(400)
        .json(new APIResponse(400, "Missing Cloudinary video URL"));

    console.log("Streaming video from Cloudinary to YouTube...");

    // Video metadata
    const videoMetadata = {
      snippet: {
        title: title,
        description: description,
        tags: tags,
        categoryId: categoryId,
      },
      status: {
        privacyStatus: "private",
      },
    };

    // Stream the video directly from Cloudinary to YouTube
    const response = await axios({
      method: "GET",
      url: cloudUrl,
      responseType: "stream",
    });

    const uploadResponse = await youtube.videos.insert({
      part: "snippet,status",
      requestBody: videoMetadata,
      media: {
        body: response.data, // Directly passing the readable stream
      },
    });

    console.log(
      "Video uploaded successfully! Video ID:",
      uploadResponse.data.id
    );

    video.youtubeVideoId = uploadResponse.data.id;
    video.filePath = undefined;
    video.cloudinaryPublicId = undefined;
    video.status = "Approved";
    video.approvedAt = Date.now();
    if (video.cloudinaryPublicId) {
      try {
        await deleteVideoFromCloudinary(video.cloudinaryPublicId);
        video.cloudinaryPublicId = undefined;
      } catch (error) {
        console.error("Error deleting video from Cloudinary:", error);
      }
    }

    await video.save();

    res
      .status(200)
      .json({ message: "Upload successful", videoId: uploadResponse.data.id });
  } catch (error) {
    console.error("Error uploading video:", error);
    res
      .status(500)
      .json({ error: "Failed to upload video", details: error.message });
  }
};

export { uploadOnYT };
