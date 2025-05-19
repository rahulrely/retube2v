import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const rawVideoSchema = new Schema({

    vid :{type : String , required : true ,index : true , unique : true},

    instructions : {type : String , default : null},

    uploader: { type : String, required : true }, // Secondary User Email

    downloader: { type : String, required : true  }, // Primary User Email

    title: { type : String, required : true  },

    filePath: {  type : String }, // Cloud storage before approval // #cloudinary

    cloudinaryPublicID: {type : String , required : true} ,

    status: { type : String, enum: ["sent", "downloaded"], default : "sent" }
},
    {
        timestamps : true
    }
);

rawVideoSchema.plugin(mongooseAggregatePaginate);

const Raw = mongoose.model("raws",rawVideoSchema);

export default Raw;