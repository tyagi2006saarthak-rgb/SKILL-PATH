import mongoose from "mongoose";

const learningResourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    skill: { type: String, required: true, trim: true, index: true },
    category: { type: String, default: "Other" },
    description: { type: String, default: "" },
    url: { type: String, required: true }
  },
  { timestamps: true }
);
learningResourceSchema.index({ name: 1, skill: 1 }, { unique: true });

export default mongoose.model("LearningResource", learningResourceSchema);
