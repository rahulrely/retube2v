import  {asyncHandler} from "../utils/asynchandler.js";
import {APIError} from "../utils/APIError.js"
import {APIResponse} from "../utils/APIResponse.js"
import User from "../models/user.model.js"

const registerUser = asyncHandler(async(req,res) =>{
    //get user details from frontend
    //vaildations
    //check if user exits in db
    //create user objext and entry in db
    //remove password
    // return res
    const { name, email , password , role, inviteToken} = req.body
    
    // if(!name === "") throw new APIError(400,"Name is Required");

    if(
        [name,email,password,role].some((field) => field?.trim() === "")
    ){
        throw new APIError(400,"All fields are required")
    }

    const existedUser = await User.findOne({ email}); //to add isVerified

    if(existedUser){
        throw new APIError(409,"Already Exist User");
    }

    const user = await User.create({
        name,
        email,
        password,
        role
    })
    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -inviteToken"
    )
    // console.log(createdUser);
    if(!createdUser){
        throw new APIError(500,"Unable to Create User")
    }

    return res.status(201).json(
        new APIResponse(200,createdUser,"User Registered Successfully")
    )
     
});

const loginUser = asyncHandler(async (req,res) =>{
    
})

export {
    registerUser,
    loginUser
};