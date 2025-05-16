import  {asyncHandler} from "../utils/asynchandler.js";
import {APIError} from "../utils/APIError.js";
import {APIResponse} from "../utils/APIResponse.js";
import Video from "../models/video.model.js";
import {uploadOnCloudinary} from "../utils/cloundinary.js"
import { customAlphabet} from 'nanoid';
import User from "../models/user.model.js";

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 10)


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
    const videoLocalPath = req.file?.path; // incoming from multer middleware

    if (!videoLocalPath) {
        throw new APIError(400, "Video is required");
    }

    const videofile = await uploadOnCloudinary(videoLocalPath,foldername); //Upload to Cloundinary

    if (!videofile) {
        throw new APIError(500,"Upload on Cloundinary Failed");
    }
    const vid = nanoid();

    const primaryUser = await User.findById(user.linkedUser);

    const video = await Video.create({
        vid,
        title,
        description,
        filePath : videofile.url,
        uploader : user.email,
        approver : primaryUser.email,
        cloudinaryPublicID :videofile.public_id,
        tags,
    });

    console.log(video);

    user.videoList.push(video._id);
    primaryUser.videoList.push(video._id);

    await user.save(); // saving it
    await primaryUser.save();

    // Delete local file after successful upload
    // fs.unlinkSync(videoLocalPath);
    
    const resData = { "Video DB Unicode" : video?.vid || "Not Found"}

    return res
    .status(200)
    .json( 
        new APIResponse (200,resData,"Video uploaded successfully")
    );
});

const getVideoList = asyncHandler(async (req, res) => {
    const user = req?.user; // From middleware

    if (!user) {
        throw new APIError(404, "User not found.");
    }

    const videoList = user?.videoList;

    if(videoList == null){
        return res
        .status(200)
        .json(new APIResponse(
            200,
            {
                videos : { }
            },
            "No Videos Found."
        ))
    }

    const videos = await Promise.all(
        videoList.map(videoId => Video.findById(videoId))
    );

    const newVideoList = {};

    for (let i = 0 ;i < videoList.length ; i++){
        newVideoList[videos[i].vid] = videos[i].filePath;
    }

    
    // videos.forEach(video => {
    //     if (video) {
    //         newVideoList[video.vid] = video.filePath;
    //     }
    // });


    return res
        .status(200)
        .json(new APIResponse(
            200,
            {
                videos : newVideoList
            },
            "Video Successfully fetched."
        ))

});


const getVideo = asyncHandler(async(req,res)=>{
    const { vid } = req.params;

    const video = await Video.findOne({ vid });

    if(!video){
        throw new APIError(404,"Video Not Found.");
    }
    
    return res
        .status(200)
        .json(new APIResponse(
            200,
            {   "vid" : video?.vid,
                "url" : video?.filePath,
                "cloudinaryPublicID" : video?.cloudinaryPublicID
            },
            "Video Successfully fetched."
    ));
    
});

export {
    videoUploadOnCloud,
    getVideo,
    getVideoList
}