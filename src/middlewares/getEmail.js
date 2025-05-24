import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asynchandler.js";

export const getEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.query;

    if (!email) {
        throw new APIError(400, "Email ID is required");
    }

    //Decode the email (prevents encoding issues)
    const decodedEmail = decodeURIComponent(email);

    //Basic email format validation (optional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(decodedEmail)) {
        throw new APIError(400, "Invalid email format");
    }

    //Attach to request object & move to next middleware
    req.email = decodedEmail;
    next();
});