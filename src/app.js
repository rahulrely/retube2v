import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from 'express-session';
const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));

app.use(express.json({
    limit:"20kb"
}));

app.use(express.urlencoded({extended:true , limit :"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET, // Replace with a strong secret
    resave: false,
    saveUninitialized: false,
}));

//routes import
import userRouter  from "./routes/user.route.js"
import videoRouter from "./routes/video.route.js"
import rawVideosRouter from "./routes/raw.video.route.js";
// import dashboardRouter from "./routes/dashboard.route.js"
//routes declarations
app.use("/api/v1/users",userRouter);
app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/raw",rawVideosRouter);
// app.use("/api/v1/dashboard",dashboardRouter);


export {app} ;