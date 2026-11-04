import mongoose from "mongoose";
import ActivityLog from "../models/ActivityLog.js";
import CareerRole from "../models/CareerRole.js";
import Roadmap from "../models/Roadmap.js";
import RoadmapTask from "../models/RoadmapTask.js";
import Skill from "../models/Skill.js";
import User from "../models/User.js";
import { analyzeSkills, orderRoadmapTasks } from "../services/analysis.js";

const logActivity = (user, fields) => ActivityLog.create({ user, ...fields });

export async function listSkills(req, res, next) {
  try {
    res.json(await Skill.find({ user: req.user.id }).sort({ name: 1 }));
  } catch (error) { next(error); }
}

export async function createSkill(req, res, next) {
  try {
    const { name, category, proficiency } = req.body;
    if (!name?.trim() || !category || !Number.isInteger(Number(proficiency)) || Number(proficiency) < 1 || Number(proficiency) > 5) {
      return res.status(400).json({ message: "Enter a skill name, category, and proficiency from 1 to 5." });
    }
    const skill = await Skill.create({ user: req.user.id, name: name.trim(), category, proficiency: Number(proficiency) });
    await logActivity(req.user.id, { type: "skill", title: "Skill added", description: `${skill.name} added to your toolkit.`, skillName: skill.name, proficiency: skill.proficiency });
    res.status(201).json(skill);
  } catch (error) { next(error); }
}

export async function updateSkill(req, res, next) {
  try {
    const { name, category, proficiency } = req.body;
    if (!name?.trim() || !category || !Number.isInteger(Number(proficiency)) || Number(proficiency) < 1 || Number(proficiency) > 5) {
      return res.status(400).json({ message: "Enter a skill name, category, and proficiency from 1 to 5." });
    }
    const skill = await Skill.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name: name.trim(), category, proficiency: Number(proficiency) },
      { new: true, runValidators: true }
    );
    if (!skill) return res.status(404).json({ message: "Skill not found." });
    await logActivity(req.user.id, { type: "skill", title: "Skill updated", description: `${skill.name} updated to ${skill.proficiency}/5.`, skillName: skill.name, proficiency: skill.proficiency });
    res.json(skill);
  } catch (error) { next(error); }
}

export async function deleteSkill(req, res, next) {
  try {
    const skill = await Skill.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!skill) return res.status(404).json({ message: "Skill not found." });
    await logActivity(req.user.id, { type: "skill", title: "Skill removed", description: `${skill.name} removed from your toolkit.`, skillName: skill.name });
    res.json({ message: "Skill deleted." });
  } catch (error) { next(error); }
}

export async function listCareers(req, res, next) {
  try {
    const careers = await CareerRole.find().select("title description icon requiredSkills");
    res.json(careers);
  } catch (error) { next(error); }
}

export async function getCareer(req, res, next) {
  try {
    const career = await CareerRole.findById(req.params.id);
    if (!career) return res.status(404).json({ message: "Career role not found." });
    res.json(career);
  } catch (error) { next(error); }
}

export async function analyzeCareer(req, res, next) {
  try {
    const career = await CareerRole.findById(req.params.id);
    if (!career) return res.status(404).json({ message: "Career role not found." });
    const skills = await Skill.find({ user: req.user.id });
    const gaps = analyzeSkills(career.requiredSkills, skills);
    res.json({ career, gaps, summary: { achieved: gaps.filter((g) => !g.gap).length, needsWork: gaps.filter((g) => g.gap > 0).length } });
  } catch (error) { next(error); }
}

export async function generateRoadmap(req, res, next) {
  try {
    const careerId = req.body.careerId || req.user.targetCareer;
    if (!careerId) return res.status(400).json({ message: "Choose a career goal first." });
    const career = await CareerRole.findById(careerId);
    if (!career) return res.status(404).json({ message: "Career role not found." });
    const skills = await Skill.find({ user: req.user.id });
    const ordered = orderRoadmapTasks(analyzeSkills(career.requiredSkills, skills));
    const tasks = ordered.map((gap) => ({
      skillName: gap.name,
      description: `Build your ${gap.name} proficiency from level ${gap.currentLevel} to level ${gap.requiredLevel}.`,
      priority: gap.priority,
      priorityScore: gap.priorityScore,
      durationHours: Math.max(2, gap.gap * 4),
      resource: gap.resource,
      prerequisite: gap.prerequisites.find((item) => ordered.some((task) => task.name.toLowerCase() === item.toLowerCase())) || "",
      status: "Pending",
      progress: 0
    }));
    await Roadmap.updateMany({ user: req.user.id, active: true }, { active: false });
    const roadmap = await Roadmap.create({ user: req.user.id, career: career.id, tasks: [] });
    const createdTasks = await RoadmapTask.insertMany(tasks.map((task) => ({ ...task, roadmap: roadmap.id, user: req.user.id })));
    roadmap.tasks = createdTasks.map((task) => task.id);
    await roadmap.save();
    await User.findByIdAndUpdate(req.user.id, { targetCareer: career.id });
    await logActivity(req.user.id, { type: "roadmap", title: "Learning plan created", description: `A ${career.title} learning roadmap was generated.`, roadmap: roadmap.id });
    res.status(201).json(await roadmap.populate(["career", "tasks"]));
  } catch (error) { next(error); }
}

export async function listRoadmaps(req, res, next) {
  try {
    const roadmaps = await Roadmap.find({ user: req.user.id }).populate("career", "title description").populate("tasks").sort({ createdAt: -1 });
    res.json(roadmaps);
  } catch (error) { next(error); }
}

export async function getRoadmap(req, res, next) {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user.id }).populate("career", "title description").populate("tasks");
    if (!roadmap) return res.status(404).json({ message: "Roadmap not found." });
    res.json(roadmap);
  } catch (error) { next(error); }
}

export async function updateTaskStatus(req, res, next) {
  try {
    const { status, progress } = req.body;
    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Choose a valid task status." });
    }
    const roadmap = await Roadmap.findOne({ _id: req.params.roadmapId, user: req.user.id });
    if (!roadmap) return res.status(404).json({ message: "Roadmap not found." });
    const task = await RoadmapTask.findOne({ _id: req.params.taskId, roadmap: roadmap.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found." });
    task.status = status;
    task.progress = status === "Completed" ? 100 : status === "Pending" ? 0 : Math.min(99, Math.max(1, Number(progress) || 25));
    task.completedAt = status === "Completed" ? new Date() : null;
    await task.save();
    await logActivity(req.user.id, { type: "task", title: `Task ${status.toLowerCase()}`, description: `${task.skillName} marked ${status.toLowerCase()}.`, skillName: task.skillName, roadmap: roadmap.id });
    res.json(await roadmap.populate(["career", "tasks"]));
  } catch (error) { next(error); }
}

export async function deleteTask(req, res, next) {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.roadmapId, user: req.user.id });
    if (!roadmap) return res.status(404).json({ message: "Roadmap not found." });
    const task = await RoadmapTask.findOne({ _id: req.params.taskId, roadmap: roadmap.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found." });
    await task.deleteOne();
    roadmap.tasks.pull(task.id);
    await roadmap.save();
    await logActivity(req.user.id, { type: "task", title: "Task removed", description: `${task.skillName} removed from a roadmap.`, skillName: task.skillName, roadmap: roadmap.id });
    res.json(await roadmap.populate(["career", "tasks"]));
  } catch (error) { next(error); }
}

export async function getProfile(req, res, next) {
  try {
    const user = await req.user.populate("targetCareer", "title");
    res.json({ user: { id: user.id, name: user.name, email: user.email, college: user.college, course: user.course, year: user.year, targetCareer: user.targetCareer } });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const fields = ["name", "college", "course", "year", "targetCareer"];
    for (const field of fields) {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    }
    if (req.body.targetCareer === "") req.user.targetCareer = null;
    if (!req.user.name?.trim()) return res.status(400).json({ message: "Name is required." });
    if (req.user.targetCareer && !mongoose.isValidObjectId(req.user.targetCareer)) return res.status(400).json({ message: "Choose a valid career goal." });
    if (req.user.targetCareer && !(await CareerRole.exists({ _id: req.user.targetCareer }))) return res.status(400).json({ message: "Choose an existing career goal." });
    await req.user.save();
    await req.user.populate("targetCareer", "title");
    res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, college: req.user.college, course: req.user.course, year: req.user.year, targetCareer: req.user.targetCareer } });
  } catch (error) { next(error); }
}

export async function dashboardStats(req, res, next) {
  try {
    const [skills, roadmaps] = await Promise.all([
      Skill.find({ user: req.user.id }),
      Roadmap.find({ user: req.user.id }).populate("career", "title").populate("tasks").sort({ createdAt: -1 })
    ]);
    const activeRoadmap = roadmaps.find((roadmap) => roadmap.active) || roadmaps[0] || null;
    const tasks = activeRoadmap?.tasks || [];
    const completed = tasks.filter((task) => task.status === "Completed").length;
    const active = tasks.filter((task) => task.status === "In Progress").length;
    const careerCount = new Set(roadmaps.map((roadmap) => String(roadmap.career?._id || roadmap.career))).size;
    let gaps = [];
    if (activeRoadmap?.career?._id) {
      const career = await CareerRole.findById(activeRoadmap.career._id);
      if (career) gaps = analyzeSkills(career.requiredSkills, skills);
    }

    const result = {
      totalSkills: skills.length,
      skillsToImprove: gaps.filter((gap) => gap.gap > 0).length,
      careerRolesExplored: careerCount,
      activeTasks: active,
      completedTasks: completed,
      totalTasks: tasks.length,
      progress: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
      career: activeRoadmap?.career || null,
      proficiency: skills.map((skill) => ({ name: skill.name, proficiency: skill.proficiency })),
      gaps: gaps.filter((gap) => gap.gap > 0).sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 7),
      roadmap: tasks.map((task) => ({ name: task.skillName, status: task.status, progress: task.progress }))
    };
    res.json(result);
  } catch (error) { next(error); }
}

export async function progressSummary(req, res, next) {
  try {
    const [roadmaps, activities] = await Promise.all([
      Roadmap.find({ user: req.user.id, active: true }).populate("career", "title").populate("tasks").sort({ createdAt: -1 }),
      ActivityLog.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50)
    ]);
    const roadmap = roadmaps[0] || null;
    const tasks = roadmap?.tasks || [];
    const completed = tasks.filter((task) => task.status === "Completed").length;
    const skillHistory = [...activities]
      .filter((activity) => activity.type === "skill" && activity.proficiency)
      .reverse()
      .map((activity) => ({
        date: activity.createdAt,
        label: new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(activity.createdAt),
        skill: activity.skillName,
        proficiency: activity.proficiency
      }));
    res.json({
      career: roadmap?.career || null,
      totals: {
        tasks: tasks.length,
        completed,
        inProgress: tasks.filter((task) => task.status === "In Progress").length,
        pending: tasks.filter((task) => task.status === "Pending").length,
        progress: tasks.length ? Math.round((completed / tasks.length) * 100) : 0
      },
      skillHistory,
      activities: activities.map((activity) => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        createdAt: activity.createdAt
      }))
    });
  } catch (error) { next(error); }
}
