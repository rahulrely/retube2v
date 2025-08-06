import { Router } from "express";
import {
  uploadForDownload,
  deleteVideoForDownload,
  getRawVideoList,
  getRawVideo,
  downloadedRawVideo,
} from "../controllers/raw.video.controller.js";
import { verifyJwt } from "../middlewares/auth.js";
import { primaryCheck, secondaryCheck } from "../middlewares/checkRole.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router
  .route("/cloud/upload")
  .post(
    verifyJwt,
    primaryCheck,
    upload.single("rawVideoFile"),
    uploadForDownload
  ); // Primary User Upload on Cloud #Cloundinary

router.route("/:vid").get(verifyJwt, getRawVideo);

router.route("/video/list").get(verifyJwt, getRawVideoList); // Get The List of Raw Videos Uploaded On Cloud #Cloundinary.

router.route("/videodownloaded").post(verifyJwt, downloadedRawVideo);

export default router;
