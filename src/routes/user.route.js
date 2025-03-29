import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    verifyPrimaryUser, 
    registerUser 
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.js";
import { getEmail } from "../middlewares/getEmail.js";

const router = Router();

router.route("/register").post(registerUser);

//Email verification route (GET to check, POST to verify)
router.route("/verify")
    .get(getEmail, verifyPrimaryUser) // Example: GET /verify?email=a@a.com&verifyCode=123456
    .post(getEmail, verifyPrimaryUser); // Example: POST with { verifyCode: "123456" }

router.route("/login").post(loginUser);

//Secured routes
router.route("/logout").post(verifyJwt, logoutUser);

export default router;