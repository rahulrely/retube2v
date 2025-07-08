import { asyncHandler } from "../utils/asynchandler.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import User from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import url from 'url';
import { oauth2Client } from "../google/auth.js";
import {
    sendVerificationEmail,
    sendInviteCodeEmail,
    sendPrimarySuccessEmail,
    sendSecondarySuccessEmail
} from "../utils/email.resend.js";
import CryptoJS from 'crypto-js';
import {
    generateInviteCodeEmailHTML
} from "../email/mailTemplet.js";

/**
 * Generates a random invite token.
 * @param {number} length - The desired length of the token.
 * @returns {string} The generated token.
 */
function generateInviteToken(length = 20) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let token = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        token += charset[bytes[i] % charset.length];
    }
    return token;
}

/**
 * Generates an access token and a refresh token for a given user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{accessToken: string, refreshToken: string}>} An object containing the access and refresh tokens.
 * @throws {APIError} If something goes wrong during token generation.
 */
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // Save the new refresh token

        return { accessToken, refreshToken };

    } catch (error) {
        throw new APIError(500, "Went Wrong while generating refresh and access token");
    }
}

/**
 * Generates a random 6-digit verification code.
 * @returns {string} The generated verification code.
 */
const genVerificationCode = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Checks the availability of an email address.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const checkEmailAvailability = asyncHandler(async (req, res) => {
    const encodedEmail = req.query.email;

    if (!encodedEmail) {
        throw new APIError(404, "Email is Required to check");
    }
    const decodedEmail = decodeURIComponent(encodedEmail);

    const foundUser = await User.findOne({ email: decodedEmail });

    if (foundUser) {
        return res
            .status(200)
            .json({
                message: "This Email ID is Already Registered with Us",
                success: true,
                status: 200
            });
    } else {
        return res
            .status(200)
            .json({
                message: "Email ID is Available",
                success: true,
                status: 200
            });
    }
});

/**
 * Registers a new user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validate input fields
    if ([name, email, password, role].some((field) => !field?.trim())) {
        throw new APIError(400, "All fields are required");
    }

    // Check if user already exists
    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new APIError(409, "User already exists");
    }

    // Generate invite code & verification code
    const inviteCode = generateInviteToken();
    const inviteCodeExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days

    const verifyCode = genVerificationCode();
    const verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    //Generating tempToken for Registeration Process
    const tempToken = jwt.sign(
        { email }, // generating using email
        process.env.TEMP_TOKEN_SECRET,
        { expiresIn: process.env.TEMP_TOKEN_EXPIRY }
    );

    // Create User 
    const user = await User.create({
        name,
        email,
        password,
        role,
        verifyCode,
        tempToken, 
        verifyCodeExpiry,
        ...(role === "Primary" && { inviteCode }), // Only add inviteCode for "primary" users
        ...(role === "Primary" && { inviteCodeExpiry })
    });

    console.log("Registered User:", user);

    // Email is Not Enabled due to Domain Purchased Required
    // Send verification email after user is created
    // try {
    //     await sendVerificationEmail(email, name, verifyCode);
    //     console.log(`Verification email sent to ${email}`);
    // } catch (err) {
    //     console.error(`Email sending failed: ${err.message}`);
    //     throw new APIError(500, "User registered but failed to send verification email");
    // }
    // Fetch created user without sensitive data
    const createdUser = await User.findById(user._id).select("-password -refreshToken -inviteCode");
    if (!createdUser) {
        throw new APIError(500, "Unable to retrieve user data after registration");
    }

    // Cookie options for tempToken
    const tempTokenCookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "None", // critical for cross-origin cookies
        maxAge: 1000 * 60 * 15, // 15 min expiry for tempToken
    };
    console.log("Regsiter Route End");
    return res
        .status(201)
        .cookie("tempToken", tempToken, tempTokenCookieOptions)
        .json(
            new APIResponse(200, createdUser, "User registered successfully. Verification email sent.")
        );
});

/**
 * Verifies user using a code and tempToken from cookies.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const verifyUser = asyncHandler(async (req, res) => {
    const tempToken = req.cookies?.tempToken;

    if (!tempToken) {
        throw new APIError(404, "No temp cookie found for verification.");
    }
    const decodeToken = jwt.verify(tempToken, process.env.TEMP_TOKEN_SECRET);

    const email = decodeToken.email;
    const { verifyCode } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new APIError(404, "User doesn't exist");
    }

    // Check if verification code is expired
    const isCodeValid = user.verifyCodeExpiry && user.verifyCodeExpiry > Date.now();
    if (!isCodeValid) {
        throw new APIError(400, `Verification code validity expired ${Date.now()}`);
    }

    // Check if verify code is correct & not expired
    if (user.verifyCode === verifyCode) {
        user.isVerified = true;
        user.verifyCode = undefined;
        user.verifyCodeExpiry = undefined;

        // Save changes to database
        await user.save({ validateBeforeSave: false }); // Set validateBeforeSave to false if verifyCode/Expiry are being unset

        const userrole = user.role;
        return res.status(200).json(
            new APIResponse(200, { role: userrole }, "User is successfully verified")
        );
    }

    throw new APIError(400, "Invalid verification code");
});

/**
 * Verifies user without a verification code (#Temporary).
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const verifyUserNOT = asyncHandler(async (req, res) => {
    const tempToken = req.cookies?.tempToken;

    if (!tempToken) {
        throw new APIError(404, "No temp cookie found for verification.");
    }
    const decodeToken = jwt.verify(tempToken, process.env.TEMP_TOKEN_SECRET);

    const email = decodeToken.email;

    const user = await User.findOne({ email });

    if (!user) {
        throw new APIError(404, "User doesn't exist");
    }

    user.isVerified = true;

    // Save changes to database
    await user.save({ validateBeforeSave: false });

    const userrole = user.role;
    return res.status(200).json(
        new APIResponse(200, { role: userrole }, "User is successfully verified")
    );
});

/**
 * Handles Google OAuth callback for linking.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const googleLink = asyncHandler(async (req, res) => {
    try {
        // Log received session data for debugging
        console.log("googleLink - req.session.emailForGoogleLink:", req.session?.emailForGoogleLink);
        console.log("googleLink - req.session.state:", req.session?.state);
        console.log("googleLink - req.query.state:", req.query?.state);

        const email = req.session?.emailForGoogleLink; // Get email from session

        if (!email) {
            // Handle case where session data is missing or expired
            console.error("googleLink: Email not found in session. Session might be expired or not set.");
            throw new APIError(401, "Session data missing for Google linking. Please try registering again.");
        }

        // Handle the OAuth 2.0 server response
        let q = url.parse(req.url, true).query;

        console.log("url query received:", q);

        if (q.error) { // An error response e.g. error=access_denied
            console.error('Google OAuth Error:' + q.error);
            throw new APIError(400, `Google OAuth Error: ${q.error}`);
        }
        // CSRF State verification
        else if (q.state !== req.session.state) { // Verify state value
            console.error('State mismatch. Possible CSRF attack. Expected:', req.session.state, 'Received:', q.state);
            throw new APIError(403, 'State mismatch. Possible CSRF attack.');
        } else { // Get access and refresh tokens (if access_type is offline)
            let { tokens } = await oauth2Client.getToken(q.code);
            oauth2Client.setCredentials(tokens);

            console.log("googleToken received:", tokens);

            const googleRefreshToken = tokens?.refresh_token;
            const googleAccessToken = tokens?.access_token;

            if (!googleRefreshToken) {
                throw new APIError(405, "Google Refresh Token Not Found in Google Response");
            }
            if (!googleAccessToken) {
                throw new APIError(405, "Google Access Token Not Found in Google Response");
            }
            // Check for required scopes
            if (
                !tokens.scope.includes('https://www.googleapis.com/auth/youtube.upload')
            ) {
                throw new APIError(404, "Failed: Required scope YouTube Upload is missing!");
            }

            const user = await User.findOne({ email }); // Find user using email from session

            if (!user) {
                console.error(`User with email ${email} not found after Google OAuth.`);
                throw new APIError(404, "User not found in database for Google linking email.");
            }

            user.googleRefreshToken = googleRefreshToken; //Saving Google Refresh Token in MongoDB

            const inviteCode = user.role === "Primary" ? user.inviteCode : undefined; // Only primary users have invite codes
            const name = user.name;

            const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

            await user.save({ validateBeforeSave: false }); // saving to db

            // --- Clear session data after successful linking ---
            if (req.session) {
                req.session.emailForGoogleLink = undefined;
                req.session.state = undefined; // Clear CSRF state
                // req.session.destroy((err) => {
                //     if (err) console.error("Error destroying session:", err);
                // });
            }

            const options = {
                httpOnly: true,
                secure: true,
                sameSite: "None", 
            };
            return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .redirect(`${process.env.FRONTEND_SUCCESS_URL}?linked=true`);
        }
    } catch (error) {
        console.error("Error In Google Linking:", error);
        // Redirect to a frontend error page with a helpful message
        const errorMessage = error instanceof APIError ? error.message : "An unexpected error occurred during Google linking.";
        const statusCode = error instanceof APIError ? error.statusCode : 500;
        return res.status(statusCode).redirect(`${process.env.FRONTEND_ERROR_URL}?error=${encodeURIComponent(errorMessage)}`);
    }
});

/**
 * Sends invite code via email. (#Temporary)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const inviteCodefun = asyncHandler(async (req, res) => {
    // This function still relies on tempToken cookie.
    const tempToken = req.cookies?.tempToken;
    if(!tempToken){
        throw new APIError(404,"No temp cookie found for invite code generation.");
    }
    const { email: xemail } = jwt.verify(tempToken, process.env.TEMP_TOKEN_SECRET); // Using xemail to avoid conflict

    const user = await User.findOne({ email: xemail }); // Use xemail from the token

    if(!user) {
        throw new APIError(404, "User not found for invite code email.");
    }

    const email = user?.email;
    const name = user?.name;
    const inviteCode = user?.inviteCode; // Ensure inviteCode exists on Primary user

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        domain: process.env.COOKIE_DOMAIN || undefined,
    }

    const htmlInvite = generateInviteCodeEmailHTML(name, email, inviteCode);
    return res
        .status(200)
        .clearCookie('tempToken', options)
        .json(
            new APIResponse(
                200,
                {
                    html: htmlInvite
                },
                "Your account successfully created. Now share with your secondary"
            )
        );
});

/**
 * Links primary and secondary users.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const primaryAndSecondaryLink = asyncHandler(async (req, res) => {
    // This function still relies on tempToken cookie.
    const tempToken = req.cookies?.tempToken;
    if (!tempToken) {
        throw new APIError(404, "No temp cookie found for linking primary and secondary users.");
    }
    const decodeToken = jwt.verify(tempToken, process.env.TEMP_TOKEN_SECRET);

    const secondaryEmail = decodeToken.email;
    const { email, inviteCode } = req.body; // email here is primary user's email

    if (!email) {
        throw new APIError(404, "Primary user email not received");
    }
    if (!inviteCode) {
        throw new APIError(404, "Invite code not received");
    }
    // Fetch users from DB
    const primaryUser = await User.findOne({ email });
    const secondaryUser = await User.findOne({ email: secondaryEmail });

    if (!primaryUser) {
        throw new APIError(404, "Primary user not found");
    }
    if (!secondaryUser) {
        throw new APIError(404, "Secondary user not found");
    }

    // Check if invite code is expired
    const isCodeValid = primaryUser.inviteCodeExpiry && primaryUser.inviteCodeExpiry > Date.now();
    if (!isCodeValid) {
        throw new APIError(400, `Invitation code validity expired ${Date.now()}`);
    }

    // Validate the invite code's content
    if (primaryUser.inviteCode !== inviteCode) {
        throw new APIError(400, "Invalid invite code");
    }

    // Link users
    secondaryUser.linkedUser = primaryUser._id;
    primaryUser.linkedUser = secondaryUser._id;

    secondaryUser.inviteCode = undefined; // Clear inviteCode for secondary after linking
    secondaryUser.tempToken = undefined; // Clear tempToken field in DB if present

    primaryUser.inviteCode = undefined; // Clear inviteCode for primary after linking
    primaryUser.inviteCodeExpiry = undefined;

    //email details
    const primaryUserName = primaryUser.name;
    const secondaryUserName = secondaryUser.name;
    const primaryUserEmail = primaryUser.email;
    const secondaryUserEmail = secondaryUser.email;

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(secondaryUser._id);

    // Save changes to DB
    await secondaryUser.save({ validateBeforeSave: false });
    await primaryUser.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        domain: process.env.COOKIE_DOMAIN || undefined, // Set a base domain like '.onrender.com'
    }

    // Send Success for Primary User email
    // try {
    //     await sendPrimarySuccessEmail(primaryUserEmail, primaryUserName);
    //     console.log(`Sent Success for Primary User email ${primaryUserEmail}`);
    // } catch (err) {
    //     console.error(`Email sending failed: ${err.message}`);
    //     throw new APIError(500, "Users linked but failed to Success for Primary User email");
    // }

    // Send Success for Secondary User email
    // try {
    //     await sendSecondarySuccessEmail(secondaryUserEmail,secondaryUserName,primaryUserName);
    //     console.log(`Sent Success for Secondary User email ${secondaryUserEmail}`);
    // } catch (err) {
    //     console.error(`Email sending failed: ${err.message}`);
    //     throw new APIError(500, "Users linked but failed to send Success for Secondary User email");
    // }

    return res
        .status(200)
        .clearCookie('tempToken', options) // Clear tempToken cookie
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .redirect(`${process.env.FRONTEND_SEC_SUCCESS_URL}?linked=true`);
});

/**
 * Logs in a user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new APIError(404, "Email is required for login");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new APIError(404, "User doesn't Exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new APIError(401, "Password Incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // If db call is expensive then don't do below call and update previous user #04
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -inviteCode");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None", // Ensure consistent SameSite
        domain: process.env.COOKIE_DOMAIN || undefined, // Set a base domain
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new APIResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken // for mobile apps
                },
                "User logged In Successfully"
            )
        );
});

/**
 * Initiates password reset by sending a verification code.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const passwordReset = asyncHandler(async (req, res) => {
    const user = req.user; // middleware incoming

    const email = user.email;
    const name = user.name;

    // Generate verification code
    const verifyCodeGen = genVerificationCode();
    const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    user.forgetPasswordCode = verifyCodeGen;
    user.forgetPasswordCodeExpiry = verifyCodeExpiry;

    await user.save({ validateBeforeSave: false }); // Save code in DB

    // Sending verification email
    // try {
    //     await sendVerificationEmail(email, name, verifyCodeGen);
    //     console.log(`Verification email sent to ${email}`);
    // } catch (err) {
    //     console.error(`Email sending failed: ${err.message}`);
    //     throw new APIError(500, "Password Reset failed email");
    // }

    // Get user input from body (This part of the code is usually in a separate endpoint
    // for actual password reset verification, not the initiation. Leaving as-is per original structure)
    const { newPassword, verifyCode } = req.body;

    const freshUser = await User.findById(user._id);

    if (!freshUser) {
        throw new APIError(400, "User not found");
    }
    // Retrieve stored expiry from DB
    const isCodeValid = freshUser.verifyCodeExpiry && freshUser.verifyCodeExpiry > Date.now();
    if (!isCodeValid) {
        throw new APIError(400, "Verification code validity expired");
    }

    // Verify if entered code matches stored code
    if (freshUser.forgetPasswordCode !== verifyCode) {
        throw new APIError(400, "Invalid verification code");
    }

    // Updated password
    freshUser.password = newPassword;
    freshUser.forgetPasswordCode = null; // Removed verification code after use
    freshUser.forgetPasswordCodeExpiry = null;

    await freshUser.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new APIResponse(200, {}, "Password changed successfully"));

});

/**
 * Logs out a user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }, {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        domain: process.env.COOKIE_DOMAIN || undefined,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new APIResponse(200, {}, "User Logged Out"));

});

/**
 * Checks the user's role.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const rolecheck = asyncHandler(async (req, res) => {
    const user = req?.user; // user from auth middleware

    if (!user) {
        throw new APIError(401, "Unauthorized: User not found");
    }

    if (user.role === "Primary" || user.role === "Secondary") {
        return res
            .status(200)
            .json(
                new APIResponse(200, { role: user.role }, "Role Check Successful")
            )
    }

    return res
        .status(405)
        .json(
            new APIResponse(405, {}, "Unauthorized | Invalid Account | Suspicious Account")
        )

});

/**
 * Fetches user details including linked user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const userDetails = asyncHandler(async (req, res) => {
    const user = req?.user;

    if (!user) {
        throw new APIError(403, "Invalid User or user Not found");
    }

    const linkedUser = await User.findById(user.linkedUser); // linkedUser can be null if not linked

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified,
                    // Only include linked user details if linkedUser exists
                    ...(linkedUser && { linkedUserName: linkedUser.name }),
                    ...(linkedUser && { linkedUserEmail: linkedUser.email }),
                },
                "User Details Successfully Fetched"
            )
        )
});

/**
 * Edits the user's name.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const editName = asyncHandler(async (req, res) => {
    const user = req?.user;

    if (!user) {
        throw new APIError(403, "Invalid User or User Not Found");
    };

    let { name } = req?.body;

    if (!name) {
        throw new APIError(404, "Name must be sent");
    };

    user.name = name;

    await user.save({ validateBeforeSave: false }); // Save the updated name

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                {}, // No data needed in the response body for a simple update confirmation
                "User's Name Successfully Modified."
            )
        )

});
/**
 * Send Encrypted Email to frontend.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getEncryptedEmail = asyncHandler(async (req, res) => {
    const secret = process.env.EXPRESS_SESSION_SECRET;
    
    const tempToken = req.cookies?.tempToken;
    if(!tempToken){
        throw new APIError(404,"No temp cookie found for Google Auth.");
    }
const { email } = jwt.verify(tempToken, process.env.TEMP_TOKEN_SECRET); 

if (!email) {
        throw new APIError(400, "Email ID is required");
    }

    //Basic email format validation (optional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new APIError(400, "Invalid email format");
    }
    
    const encryptedEmail = CryptoJS.AES.encrypt(email,secret).toString();
    return res
    .status(200)
    .json(
        new APIResponse(200, { email : encryptedEmail}, "Successfully Encrypted Email for Googgle Auth")
    );
});

export {
    checkEmailAvailability,
    registerUser,
    verifyUser,
    googleLink,
    primaryAndSecondaryLink,
    loginUser,
    passwordReset,
    logoutUser,
    rolecheck,
    userDetails,
    editName,
    verifyUserNOT,
    inviteCodefun,
    getEncryptedEmail
};