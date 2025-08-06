import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Define User Schema
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      unique: true,
      required: true,
      index: true,
      match:
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["Primary", "Secondary"], required: true },
    isVerified: { type: Boolean, default: false },
    forgetPasswordCode: { type: String, default: null },
    forgetPasswordCodeExpiry: { type: Date, default: null },
    verifyCode: { type: String, default: null },
    verifyCodeExpiry: { type: Date, default: null },
    refreshToken: { type: String, default: null },
    tempToken: { type: String, default: null },

    rawVideoList: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Raw", default: null },
    ],
    videoList: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Video", default: null },
    ],
    // Primary User Fields
    googleRefreshToken: { type: String, default: null },
    inviteCode: { type: String, default: null },
    inviteCodeExpiry: { type: Date, default: null },

    linkedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Pre hooks

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Define Methods
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, name: this.name },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

// Export User Model
const User = mongoose.model("User", userSchema);
export default User;
