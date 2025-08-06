import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    vid: { type: String, required: true, index: true, unique: true },

    uploader: { type: String, required: true }, // Secondary User Email

    approver: { type: String, required: true }, // Primary User Email

    title: { type: String, required: true },

    description: { type: String, default: null },

    tags: [{ type: String }], // Array of tags

    filePath: { type: String }, // Cloud storage before approval // #cloudinary

    cloudinaryPublicID: { type: String, required: true },

    youtubeVideoId: { type: String, default: null }, // YouTube Video ID after approval

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    approvedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate);

const Video = mongoose.model("videos", videoSchema);

export default Video;
