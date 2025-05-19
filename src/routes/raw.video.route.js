import { Router } from "express";
import { 
    uploadForDownload,
    deleteVideoForDownload,
    getRawVideoList,
    getRawVideoPrimary
} from "../controllers/raw.video.controller.js";
import { verifyJwt } from "../middlewares/auth.js";
import { primaryCheck , secondaryCheck } from "../middlewares/checkRole.js"
import { upload } from "../middlewares/multer.js";

const router = Router();


router.route("/cloud/upload")
    .post(
        verifyJwt,
        primaryCheck,
        upload.single("rawVideoFile")
        ,uploadForDownload
    ); // Primary User Upload on Cloud #Cloundinary


router.route("/video/list")
    .get(
        verifyJwt,
        primaryCheck,
        getRawVideoList,
    ); // Primary User Upload on Cloud #Cloundinary



export default router;