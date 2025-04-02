import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    uploader: { type : Schema.Types.ObjectId, ref : "User", required : true }, // Secondary User

    approver: { type : Schema.Types.ObjectId, ref : "User" , required : true }, // Primary User

    title: { type : String, required : true  },

    description: { type : String , default : null },

    tags: [{ type : String }], // Array of tagss

    filePath: {  type : String, required : true }, // Cloud storage before approval // #cloudinary

    duration:{ type : Number , default : null },

    isUploadedOnYoutube : { type : Boolean , default : false },

    youtubeVideoId: { type : String , default : null }, // YouTube Video ID after approval

    status: { type : String, enum: ["pending", "approved", "rejected"], default : "pending" },

    approvedAt: { type : Date } , default : null },
    {
        timestamps : true
});

videoSchema.plugin(mongooseAggregatePaginate);

const Video = mongoose.model("videos",videoSchema);

export default Video;