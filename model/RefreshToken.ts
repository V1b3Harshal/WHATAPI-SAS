// app/model/RefreshToken.ts
import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "7d" } // Auto-removes after 7 days
});

export default mongoose.models.RefreshToken || mongoose.model("RefreshToken", RefreshTokenSchema);
