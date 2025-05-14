//model\Token.ts
import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ["magicLink", "verification", "emailVerification"]  // Add "emailVerification" here
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: '15m' } // Auto-delete after 15 minutes
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Token || mongoose.model('Token', TokenSchema);
