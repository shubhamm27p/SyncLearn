import { Schema } from "mongoose";
import mongoose from "mongoose";

const userScheme = new Schema({
    name: { type: String, required: true },
    email: { type: String },
    username: { type: String, required: true, unique: true },
    password: { type: String },
    token: { type: String },
    role: { type: String, enum: ['student', 'trainer', 'admin'], default: 'student' },
    is_active: { type: Boolean, default: true },
    avatar_url: { type: String },
    googleId: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, { timestamps: true });

const User = mongoose.model("User", userScheme);

export { User };