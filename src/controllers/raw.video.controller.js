import  {asyncHandler} from "../utils/asynchandler.js";
import {APIError} from "../utils/APIError.js";
import {APIResponse} from "../utils/APIResponse.js";
import {uploadOnCloudinary} from "../utils/cloundinary.js"
import { customAlphabet} from 'nanoid';
import User from "../models/user.model.js";
import Raw from "../models/raw.video.model.js";


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
    
    const video = await Raw.create({
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

    await user.save(); 
    await secondaryUser.save(); 

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

const getRawVideoList = asyncHandler(async (req, res) => {
    const user = req?.user;

    if (!user) {
        throw new APIError(404, "User not found.");
    }

    const rawVideoList = user?.rawVideoList;

    if (!rawVideoList || rawVideoList.length === 0) {
        return res.status(200).json(new APIResponse(
            200,
            { rawVideos: [] },
            "No Raw Videos Found."
        ));
    }

    const rawVideos = await Promise.all(
        rawVideoList.map(videoId => Raw.findById(videoId))
    );

    const newRawVideoList = rawVideos
      .filter(v => v)
      .map(video => ({
        vid: video.vid,
        title: video.title,
        instruction : video.instruction,
        status: video.status,
        filePath: video.filePath,
        cloudinaryPublicID: video.cloudinaryPublicID,
      }));

    return res.status(200).json(new APIResponse(
        200,
        { rawVideos: newRawVideoList },
        "Raw Video Successfully fetched."
    ));
});

const getRawVideo = asyncHandler(async(req,res)=>{
    const { vid } = req.params;

    const rawvideo = await Raw.findOne({ vid });

    if(!rawvideo){
        throw new APIError(404,"Video Not Found.");
    }
    
    return res
        .status(200)
        .json(new APIResponse(
            200,
            {   "vid" : rawvideo?.vid,
                "url" : rawvideo?.filePath,
                "title": rawvideo?.title,
                "cloudinaryPublicID" : rawvideo?.cloudinaryPublicID,
                "status": rawvideo?.status
            },
            "Video Successfully fetched."
    ));
    
});


export {
    uploadForDownload,
    deleteVideoForDownload,
    getRawVideoList,
    getRawVideo
}