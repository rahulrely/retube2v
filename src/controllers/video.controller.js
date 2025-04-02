import  {asyncHandler} from "../utils/asynchandler.js";
import {APIError} from "../utils/APIError.js";
import {APIResponse} from "../utils/APIResponse.js";
import Video from "../models/video.model.js";
import fs from "fs";
import {uploadOnCloudinary} from "../utils/cloundinary.js"
import nanoid from 'nanoid';


const videoUploadOnCloud = asyncHandler(async (req,res)=>{ 
    const user = req?.user;
    
    if(!user){
        throw new APIError(404,"Invaild User Not Found")
    }

    const foldername = user.email.split("@")[0]; //foldername based on username of secondary user 
    let { title , description ,tags} = req.body

    if (!title || title.trim() === "") {
        title = `Video uploaded by ${foldername}`;
    }
    if (!description || description.trim() === "") {
        description = `Video uploaded from Retube App ${process.env.DOMAIN}`;
    }

    if (!Array.isArray(tags)) {
        tags = ["Retube", "Retube APP"];
    }

    
    //video local path
    const videoLocalPath = req.files?.videoFile?.path; // incoming from multer middleware

    if (!videoLocalPath) {
        throw new APIError(400, "Video is required");
    }

    const videofile = await uploadOnCloudinary(videoLocalPath,foldername); //Upload to Cloundinary

    if (!videofile) {
        throw new APIError(500,"Upload on Cloundinary Failed");
    }
    const unicode = nanoid(10);

    const video = await Video.create({
        unicode,
        title,
        description,
        filePath : videofile.url,
        uploader : user._id,
        approver : user.primaryUser._id,
        tags,
    });

    console.log(video);

    user.videoList.push(video._id);
    user.primaryUser.videoList.push(video._id);

    await user.save(); // saving it

    // Delete local file after successful upload
    fs.unlinkSync(videoLocalPath);
    
    return res
    .status(200)
    .json( 
        new APIResponse (200,{ "Video DB Unicode" : video.unicode },"Video uploaded successfully")
    );
});

export {
    videoUploadOnCloud
}