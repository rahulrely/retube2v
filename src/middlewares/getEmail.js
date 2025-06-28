import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import CryptoJS from 'crypto-js';
import jwt from "jsonwebtoken";
import { APIError } from "../utils/APIError.js";

export const getEmail = asyncHandler(async (req, res, next) => {
    // const secret = process.env.EXPRESS_SESSION_SECRET;
    // const { email } = req.query;
    
    // if (!email) {
    //     throw new APIError(400, "Email ID is required");
    // }
    // //Decode the email (prevents encoding issues)
    // const decodedEmail = decodeURIComponent(email);

    // const bytes = CryptoJS.AES.decrypt(decodedEmail, secret);
    // const decryptEmail = bytes.toString(CryptoJS.enc.Utf8);
    
    const tempToken = req.cookies?.tempToken;
    if(!tempToken){
        throw new APIError(404,"No temp cookie found for Google Auth.");
    }
    const { email } = jwt.verify(tempToken, process.env.TEMP_TOKEN_SECRET); 
    const decryptEmail = email;

    //Basic email format validation (optional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(decryptEmail)) {
        throw new APIError(400, "Invalid email format");
    }

    //Attach to request object & move to next middleware
    req.email = decryptEmail;
    next();
});