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
    userDetails,
    editName,
    verifyUserNOT,
    inviteCodefun,
    getEncryptedEmail
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.js";
import { genGoogleURL } from "../google/auth.js";
import { getEmail } from "../middlewares/getEmail.js";

const router = Router();

router.route("/emailavailability").get(checkEmailAvailability);

router.route("/register").post(registerUser);

//Email verification route (GET to check, POST to verify)
router.route("/verify").post(verifyUser); // Example: POST with { verifyCode: "123456" }

router.route("/bypassVerification").post(verifyUserNOT);
//link secondary to primary 
router.route("/linkprimary").post(primaryAndSecondaryLink) // Example: POST with {email :"b@b.com" , inviteToken : "abc"}

router.route("/login").post(loginUser);

///Google ##Start

// Step 0: 
router.route("/email").get(getEncryptedEmail)

// Step 1: Redirect user to Google for authentication
router.route("/google").get(getEmail,genGoogleURL);

// Step 2: Handle Google OAuth Callback
router.route("/google/callback").get(googleLink);

///Google ##End

//Secured routes

router.route("/invite").get(inviteCodefun); //invitetoken

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

router.route("/editprofile")
    .patch(
        verifyJwt,
        editName
    )

export default router;