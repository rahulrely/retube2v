import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asynchandler.js";

const primaryCheck = asyncHandler(async (req, res, next) => {
    const user = req?.user; // user from auth middleware

    if (!user) {
        throw new APIError(401, "Unauthorized: User not found");
    }

    if (user.role !== "primary") {
        throw new APIError(403, "Forbidden: Primary User Access Only");
    }

    next();
});

const secondaryCheck = asyncHandler(async (req, res, next) => {
    const user = req?.user; // user from auth middleware

    if (!user) {
        throw new APIError(401, "Unauthorized: User not found");
    }

    if (user.role !== "secondary") {
        throw new APIError(403, "Forbidden: Secondary User Access Only");
    }

    next();
});

export { primaryCheck, secondaryCheck };
