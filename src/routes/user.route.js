import { Router } from "express";
import {
    checkEmailAvailability,
    loginUser, 
    logoutUser, 
    verifyUser,
    googleLink,
    primaryAndSecondaryLink,
    passwordReset, 
    registerUser,
    rolecheck,
    userDetails
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.js";
import { genGoogleURL } from "../google/auth.js";

const router = Router();

router.route("/emailavailability").get(checkEmailAvailability);

router.route("/register").post(registerUser);

//Email verification route (GET to check, POST to verify)
router.route("/verify").post(verifyUser); // Example: POST with { verifyCode: "123456" }
//link secondary to primary 
router.route("/linkprimary").post(primaryAndSecondaryLink) // Example: POST with {email :"b@b.com" , inviteToken : "abc"}

router.route("/login").post(loginUser);

///Google ##Start

// Step 1: Redirect user to Google for authentication
router.route("/google").get(genGoogleURL);

// Step 2: Handle Google OAuth Callback
router.route("/google/callback").get(googleLink);

///Google ##End

//Secured routes

router.route("/rolecheck").get(verifyJwt,rolecheck);

router.route("/profile/passwordreset")
    .post(
        verifyJwt,
        passwordReset
    ); //password change

router.route("/logout")
    .post(
        verifyJwt,
        logoutUser
    );

router.route("/details")
    .get(
        verifyJwt,
        userDetails
    );

export default router;