import  {asyncHandler} from "../utils/asynchandler.js";
import {APIError} from "../utils/APIError.js";
import {APIResponse} from "../utils/APIResponse.js";
import Video from "../models/video.model.js";
import {uploadOnCloudinary} from "../utils/cloundinary.js"
import { customAlphabet} from 'nanoid';
import User from "../models/user.model.js";


const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 10)

const uploadForDownload = asyncHandler(async(req,res) =>{
    const user = req?.user;
    
    if(!user){
        throw new APIError(404,"Invaild User Not Found")
    }
    const foldername = user.email.split("@")[0]; //foldername based on username of secondary user 
    let { title , instructions} = req.body

    if (!title || title.trim() === "") {
        title = `Video uploaded by ${foldername}`;
    }
    if(!instructions){
        instructions = "No Instructions";
    }

    const videoLocalPath = req.file?.path; // incoming from multer middleware
    if (!videoLocalPath) {
        throw new APIError(400, "Video is required");
    }

    
    const rawVideoFile = await uploadOnCloudinary(videoLocalPath,foldername); //Upload to Cloundinary

    if (!rawVideoFile) {
        throw new APIError(500,"Upload on Cloundinary Failed");
    }
    const vid = nanoid();

    const secondaryUser = await User.findById(user.linkedUser);
    
    const video = await Video.create({
        vid,
        title,
        instructions,
        filePath : rawVideoFile.url,
        uploader : user.email,
        downloader : secondaryUser.email,
        cloudinaryPublicID :rawVideoFile.public_id,
    });

    user.rawVideoList.push(video._id);
    secondaryUser.rawVideoList.push(video._id);

    console.log(video)

    const resData = { "Video DB Unicode" : video?.vid || "Not Found"}

    return res
    .status(200)
    .json( 
        new APIResponse (200,resData,"Video uploaded successfully")
    );
});

const deleteVideoForDownload = asyncHandler(async(req,res) => {

});


export {
    uploadForDownload,
    deleteVideoForDownload
}