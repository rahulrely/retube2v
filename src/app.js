import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from 'express-session';
import MongoStore from 'connect-mongo';
const app = express();

if (!process.env.EXPRESS_SESSION_SECRET || !process.env.MONGO_URI) {
  console.error("Missing required env vars: EXPRESS_SESSION_SECRET or MONGO_URI");
}

app.set('trust proxy', 1);
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
    store: MongoStore.create({ // Use a persistent store for production
        mongoUrl: process.env.MONGO_URI, // Your MongoDB connection string from environment variables
        collectionName: 'sessions', // Name of the collection in your DB to store sessions
        ttl: 14 * 24 * 60 * 60, // Session TTL in seconds (e.g., 14 days)
        autoRemove: 'interval', // Auto-remove expired sessions
        autoRemoveInterval: 10, // In minutes
        dbName :"resession"
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        httpOnly: true, // Prevent client-side JS access
        // CRITICAL FOR CROSS-ORIGIN:
        sameSite: 'None', // Allow cross-site cookies
        maxAge: 1000 * 60 * 60 * 24, // 24 hours (adjust as needed)
        domain : process.env.DOMAIN
    }
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

