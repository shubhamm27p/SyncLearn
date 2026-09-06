import mongoose, { Schema } from "mongoose";

const submissionSchema = new Schema({
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    meetingId: { type: String, required: true },
    studentUsername: { type: String, required: true },
    studentName: { type: String },
    selectedOptionIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    scoreEarned: { type: Number, default: 0 },
    latencyMs: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

submissionSchema.index({ quizId: 1, studentUsername: 1 }, { unique: true });

const Submission = mongoose.model("Submission", submissionSchema);

export { Submission };
