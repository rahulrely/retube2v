import  {asyncHandler} from "../utils/asynchandler.js";
import {APIError} from "../utils/APIError.js"
import {APIResponse} from "../utils/APIResponse.js"
import User from "../models/user.model.js"
import crypto from "crypto";
import jwt  from "jsonwebtoken";
import { google } from "googleapis";
import {getGoogleOAuthClient} from "../google/auth.js"
import { sendVerificationEmail } from "../utils/VerifyEmail.Resend.js" //
import passport from "passport";

const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken =user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false});// await

        return {accessToken,refreshToken};

    } catch (error) {
        throw new APIError(500,"Went Wrong while generating refesh and assecc token");
    }
}

const genVerificationCode = () => {
    return crypto.randomInt(100000, 999999).toString();
};

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

    // Generate invite token & verification code
    const inviteToken = jwt.sign(
        { name , role }, // generating using name and role
        process.env.INVITE_TOKEN_SECRET,
        { expiresIn: process.env.INVITE_TOKEN_EXPIRY }
    );
    const verifyCode = genVerificationCode();
    const verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    //generating tempToken for email verification and google link
    const tempToken = jwt.sign(
        { email }, // generating using email
        process.env.TEMP_TOKEN_SECRET,
        { expiresIn: process.env.TEMP_TOKEN_EXPIRY }
    );
    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role,
        verifyCode,
        tempToken,
        verifyCodeExpiry,
        ...(role === "primary" && { inviteToken }) // Only add inviteToken for "primary" users
    });

    console.log(user);

    // Send verification email after user is created
    // try {
    //     await sendVerificationEmail(email, name, verifyCode);
    //     console.log(`Verification email sent to ${email}`);
    // } catch (err) {
    //     console.error(`Email sending failed: ${err.message}`);
    //     throw new APIError(500, "User registered but failed to send verification email");
    // }

    // Fetch created user without sensitive data
    const createdUser = await User.findById(user._id).select("-password -refreshToken -inviteToken");
    if (!createdUser) {
        throw new APIError(500, "Unable to retrieve user data after registration");
    }

    const options = {
        httpOnly : true,
        secure : true,
    }

    return res
    .status(201)
    .cookie("tempToken",tempToken,options)
    .json(
        new APIResponse(200, createdUser, "User registered successfully. Verification email sent.")
    );
});

const verifyUser = asyncHandler(async (req, res) => {
    const tempToken = req.cookies?.tempToken;

    if(!tempToken){
        throw new APIError(404,"No temp Cookies");
    }
    const decodeToken = jwt.verify(tempToken,process.env.TEMP_TOKEN_SECRET)    

    const email = decodeToken.email;
    const { verifyCode } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new APIError(404, "User doesn't exist");
    }

    // Check if verification code is expired
    const isCodeValid = user.verifyCodeExpiry > Date.now();
    if (!isCodeValid) {
        throw new APIError(400, "Verification code validity expired");
    }

    // Check if verify code is correct & not expired
    if (user.verifyCode === verifyCode) {
        user.isVerified = true;
        user.verifyCode = undefined;
        user.verifyCodeExpiry = undefined;
        
        // Save changes to database
        await user.save();

        return res.status(200).json(
            new APIResponse(200,"User is successfully verified")
        );
    }

    throw new APIError(400, "Invalid verification code");
});

const googleLink = asyncHandler(async (req, res) => {
    const tempToken = req.cookies?.tempToken;

    const decodeToken = jwt.verify(tempToken,process.env.TEMP_TOKEN_SECRET)
        
    if(!tempToken){
        throw new APIError(404,"No temp Cookies");
    }

    try {
        const { code } = req.query;
        if (!code) return res.status(400).json({ message: "Authorization code not found" });
    
        // Exchange code for tokens
        const { tokens } = await getGoogleOAuthClient().getToken(code);
        getGoogleOAuthClient().setCredentials(tokens);
    
        // Get user profile info
        const oauth2 = google.oauth2({ version: "v2", auth: getGoogleOAuthClient() });
        const { data } = await oauth2.userinfo.get();
    
        // Find user by email(temp cookies) and update Google details
        let user = await User.findOne({ email: decodeToken.email }).select('-password -refreshToken');
    
        if (!user) {
            throw new APIError(404,"User not found in google link");
        }

        user.googleID = data.id;
        user.googleRefreshToken = tokens.refresh_token;
        user.tempToken = undefined;
        await user.save();
    
        const options = {
            httpOnly : true,
            secure : true,
        }

        return res
        .status(200)
        .clearCookie('tempToken',options)
        .json({ message: "Google Account Linked Successfully", user });

    }catch (error) {
        console.error("Google OAuth Error:", error);
        res.status(500).json({ message: "Google authentication failed" });
    }
});

const primaryAndSecondaryLink = asyncHandler(async (req, res) => {
    const tempToken = req.cookies?.tempToken;
    if(!tempToken){
        throw new APIError(404,"No temp Cookies");
    }
    const decodeToken = jwt.verify(tempToken,process.env.TEMP_TOKEN_SECRET)
    
    const secondaryEmail = decodeToken.email;
    const { email, inviteToken } = req.body;

    // Fetch users from DB
    const primaryUser = await User.findOne({ email });
    const secondaryUser = await User.findOne({ email: secondaryEmail });

    if (!primaryUser) {
        throw new APIError(404, "Primary user not found");
    }
    if (!secondaryUser) {
        throw new APIError(404, "Secondary user not found");
    }

    // Verify JWT
    let decoded;
    try {
        decoded = jwt.verify(inviteToken, process.env.INVITE_TOKEN_SECRET);
        console.log("Decoded Token:", decoded);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new APIError(400, "Invite token has expired");
        } else {
            throw new APIError(400, "Invalid invite token");
        }
    }

    // Validate the token's content
    if (primaryUser.name !== decoded.name || primaryUser.role !== decoded.role) {
        throw new APIError(400, "Invalid invite token data");
    }

    // Link users
    secondaryUser.primaryUser = primaryUser._id;
    secondaryUser.inviteToken = undefined;
    secondaryUser.googleId = undefined;
    secondaryUser.youtubeId = undefined;
    secondaryUser.tempToken = undefined;

    primaryUser.inviteToken = undefined;
    primaryUser.primaryUser = undefined;

    // Save changes to DB
    await secondaryUser.save();
    await primaryUser.save();

    const options = {
        httpOnly : true,
        secure : true,
    }

    return res
    .status(200)
    .clearCookie('tempToken',options)
    .json(
        new APIResponse(200, "Secondary User is Linked to Primary User Successfully")
    );
});

const loginUser = asyncHandler(async (req,res) =>{
    const { email , password } = req.body;

    if(!email){
        throw new APIError(404,"Email is required for login");
    }

    const user = await User.findOne({ email });

    if(!user){
        throw new APIError(404,"User doesn't Exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new APIError(401,"Password Incorrect");
    }

    const {accessToken , refreshToken } = await generateAccessAndRefreshTokens(user._id);

    //if db call is expensive then dont do below call and update previous user #04

    const loggedInUser =await User.findById(user._id).select("-password -refreshToken -inviteToken") //#04

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new APIResponse(
            200,
            {
                user: loggedInUser, accessToken,refreshToken // for mobile apps
            },
            "User logged In Successfully"
        )
    )

    
});

const logoutUser =asyncHandler(async(req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken : undefined
            }
        },{
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new APIResponse(200,{},"User Logged Out"));
    
});


export {
    registerUser,
    verifyUser,
    googleLink,
    primaryAndSecondaryLink,
    loginUser,
    logoutUser
};