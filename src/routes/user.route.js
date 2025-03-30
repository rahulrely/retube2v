import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    verifyUser, 
    registerUser 
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.js";
import { getEmail } from "../middlewares/getEmail.js";

const router = Router();

router.route("/register").post(registerUser);

//Email verification route (GET to check, POST to verify)
router.route("/verify")
    .get(getEmail, verifyUser) // Example: GET /verify?email=a@a.com&verifyCode=123456
    .post(getEmail, verifyUser); // Example: POST with { verifyCode: "123456" }

router.route("/login").post(loginUser);

//Secured routes
router.route("/logout").post(verifyJwt, logoutUser);

export default router;