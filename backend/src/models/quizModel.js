import mongoose, { Schema } from "mongoose";

const quizSchema = new Schema({
    meetingId: { type: String, required: true },
    creatorId: { type: String },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true },
    points: { type: Number, default: 1 },
    timeLimitSeconds: { type: Number, default: 30 },
    pushedAt: { type: Date },
    expiresAt: { type: Date }
}, { timestamps: true });

const Quiz = mongoose.model("Quiz", quizSchema);

export { Quiz };
