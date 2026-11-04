import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    skillName: { type: String, default: "" },
    proficiency: { type: Number, min: 1, max: 5, default: undefined },
    roadmap: { type: mongoose.Schema.Types.ObjectId, ref: "Roadmap", default: null }
  },
  { timestamps: true }
);
activityLogSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("ActivityLog", activityLogSchema);
