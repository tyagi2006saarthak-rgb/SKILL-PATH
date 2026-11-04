import mongoose from "mongoose";

const roadmapTaskSchema = new mongoose.Schema(
  {
    roadmap: { type: mongoose.Schema.Types.ObjectId, ref: "Roadmap", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    skillName: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], required: true },
    priorityScore: { type: Number, required: true },
    durationHours: { type: Number, required: true },
    resource: {
      name: { type: String, required: true },
      description: { type: String, default: "" },
      url: { type: String, required: true }
    },
    prerequisite: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("RoadmapTask", roadmapTaskSchema);
