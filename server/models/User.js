import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    college: { type: String, trim: true, maxlength: 120, default: "" },
    course: { type: String, trim: true, maxlength: 100, default: "" },
    year: { type: String, trim: true, maxlength: 30, default: "" },
    targetCareer: { type: mongoose.Schema.Types.ObjectId, ref: "CareerRole", default: null }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
