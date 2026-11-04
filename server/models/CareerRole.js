import mongoose from "mongoose";

const requiredSkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, default: "Other" },
    targetLevel: { type: Number, min: 1, max: 5, required: true },
    importance: { type: Number, min: 1, max: 5, default: 3 },
    resource: {
      name: { type: String, required: true },
      description: { type: String, default: "" },
      url: { type: String, required: true }
    },
    prerequisites: [{ type: String }]
  },
  { _id: false }
);

const careerRoleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, default: "briefcase" },
    requiredSkills: { type: [requiredSkillSchema], required: true }
  },
  { timestamps: true }
);

export default mongoose.model("CareerRole", careerRoleSchema);
