import mongoose, { Schema } from "mongoose";

const mediaPermissionSchema = new Schema({
    sessionId: { type: String, required: true },
    userId: { type: String, required: true },
    username: { type: String },
    canPublishAudio: { type: Boolean, default: false },
    canPublishVideo: { type: Boolean, default: false },
    canScreenShare: { type: Boolean, default: false },
    updatedBy: { type: String }
}, { timestamps: true });

mediaPermissionSchema.index({ sessionId: 1, userId: 1 }, { unique: true });

const MediaPermission = mongoose.model("MediaPermission", mediaPermissionSchema);

export { MediaPermission };
