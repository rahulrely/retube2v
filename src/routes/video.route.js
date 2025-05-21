import { Router } from "express";
import { 
    videoUploadOnCloud,
    getVideo,
    getVideoList,
    rejectVideo
} from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.js";
import { primaryCheck , secondaryCheck } from "../middlewares/checkRole.js"
import {uploadOnYT} from "../google/upload.youtube.js"
import { upload } from "../middlewares/multer.js";

const router = Router();


router.route("/cloud/upload")
    .post(
        verifyJwt,
        secondaryCheck,
        upload.single("videoFile")
        ,videoUploadOnCloud
    ); // Secondary User Upload on Cloud #Cloundinary

router.route("/video/list")
    .get(
        verifyJwt,
        getVideoList
    );

router.route("/:vid")
    .get(
        verifyJwt,
        getVideo
    );


router.route("/youtube/approval")
    .post(
        verifyJwt,
        primaryCheck,
        uploadOnYT
    ); // Don't hit this route// ## very costly

router.route("/youtube/reject")
    .post(
        verifyJwt,
        primaryCheck,
        rejectVideo
    )

export default router;