import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Define User Schema
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, index: true,
      match:/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
     },
    password: { type: String, required: true },
    role: { type: String, enum: ["primary", "secondary"], required: true },
    isVerified: { type: Boolean, default: false },
    forgetPasswordToken: { type: String, default: null },
    forgetPasswordTokenExpiry: { type: Date, default: null },
    verifyCode: { type: String, default: null },
    verifyCodeExpiry: { type: Date, default: null },
    refreshToken: { type: String, default: null },

    // Primary User Fields
    googleId: { type: String, default: null },
    youtubeChannelId: { type: String, default: null },

    // Secondary User Fields
    primaryUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    inviteToken: { type: String, default: null },
  },
  { timestamps: true }
);

// Ensure unique indexes for optional fields
userSchema.index(
  { googleId: 1 },
  { unique: true, partialFilterExpression: { googleId: { $exists: true, $ne: null } } }
);
userSchema.index(
  { youtubeChannelId: 1 },
  { unique: true, partialFilterExpression: { youtubeChannelId: { $exists: true, $ne: null } } }
);

// Define Methods
userSchema.methods.isPasswordCorrect = async function (password){
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (){
  return jwt.sign(
    { _id: this._id, email: this.email, role: this.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function (){
  return jwt.sign(
    { _id: this._id, email: this.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } 
  );
};


// Export User Model
const User = mongoose.model("User", userSchema);
export default User;