import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from 'express-session';
const app = express();

const allowedOrigins = [process.env.CORS_ORIGIN,"http://localhost:3000"];
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true // Important for sending cookies with cross-origin requests
}));

app.get('/api/v1/hello', (req, res) => { //verification for beckend and frontend connections
    res.json({ message: 'Retube\'s Express Backend is Connected with You !' });
  });

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
app.use("/api/v1/users",userRouter);      // rahul.com/api/v1/users/register
app.use("/api/v1/videos",videoRouter);    // rahul.com/api/v1/videos
app.use("/api/v1/raw",rawVideosRouter);   // rahul.com/api/v1/raw/cloud/upload
// app.use("/api/v1/dashboard",dashboardRouter);
export {app} ;

