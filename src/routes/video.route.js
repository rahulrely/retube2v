import { Router } from "express";
import { 
    videoUploadOnCloud
} from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.js";
import {uploadOnYT} from "../google/upload.youtube.js"

const router = Router();


router.route("/cloud/upload").post(verifyJwt,upload.single("videoFile"),videoUploadOnCloud); // Secondary User Upload on Cloud #Cloundinary



router.route("/youtube/upload").post(verifyJwt,uploadOnYT); // Don't hit this route// ## very costly