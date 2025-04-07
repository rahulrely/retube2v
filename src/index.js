import dotenv from "dotenv"
import {app} from "./app.js"
import connectDB from "./db/dbConfig.js";

dotenv.config({
  path:'./.env'
})

connectDB()
.then(()=>{
  app.listen(process.env.PORT, ()=>{
    console.log("Server is RUNNING at PORT :",process.env.PORT)
  })
}).
catch((err)=>{
  console.log("MONGODB CONNECTION FAILED !!!",err);
});