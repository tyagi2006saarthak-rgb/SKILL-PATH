import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    career: { type: mongoose.Schema.Types.ObjectId, ref: "CareerRole", required: true },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "RoadmapTask" }],
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Roadmap", roadmapSchema);
