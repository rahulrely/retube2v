import User from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt  from "jsonwebtoken";
 

export const verifyJwt = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","") // second for mobile apps
    
        if(!token){
            throw new APIError(401,"Unauthorized Request");
        }
    
        const decodeToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken -inviteToken");
    
        if(!user){
            throw new APIError(401,"Invalid Access Token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new APIError(500,error?.message || "Went Wrong in auth logged")
    }
})