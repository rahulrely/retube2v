import  {asyncHandler} from "../utils/asynchandler.js";
import {APIError} from "../utils/APIError.js"
import {APIResponse} from "../utils/APIResponse.js"
import User from "../models/user.model.js"

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

    
})

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
    
})


export {
    registerUser,
    loginUser,
    logoutUser
};