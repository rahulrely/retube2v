import dotenv from "dotenv"

import express from "express";
import connectDB from "./db/dbConfig.js";

dotenv.config({
  path:'./env'
})

connectDB();