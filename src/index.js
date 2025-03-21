import dotenv from "dotenv"

import express from "express";
import connectDB from "./db/dbConfig.js";

dotenv.config({
  path:'./env'
})

connectDB()
.then(()=>{
  app.listen(process.env.PORT || 8000, ()=>{
    console.log("Server is RUNNING at PORT :",process.env.PORT)
  })
}).
catch((err)=>{
  console.log("MONGODB CONNECTION FAILED !!!",err);
});