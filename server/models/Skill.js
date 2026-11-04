import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    category: { type: String, required: true, trim: true },
    proficiency: { type: Number, required: true, min: 1, max: 5 }
  },
  { timestamps: true }
);
skillSchema.index({ user: 1, name: 1 }, { unique: true });

export default mongoose.model("Skill", skillSchema);
