import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";



export default async function connectDB(){
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        
        console.log(`\n MongoDB Connected !! DB HOST : ${connectionInstance.connection.host}`);
        

        // connection.on("connected",()=>{
        //     console.log("MongoDB Connected")
        // })

        // connection.on("error",(err)=>{
        //     console.log("MOngoDB connecttion error please make sure db is up and running " +err);
        //     process.exit()
        // })

    } catch (error) {
        console.log("Error with DB Connection",error);
        process.exit(1);
    }
}