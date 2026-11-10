import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, randomUUID } from "node:crypto";
import { validationResult } from "express-validator";
import User from "../models/User.js";

const signToken = (user) =>
  jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const userResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  college: user.college,
  course: user.course,
  year: user.year,
  targetCareer: user.targetCareer
});

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
    const { name, email, password, college, course, year } = req.body;
    if (await User.exists({ email })) return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      college,
      course,
      year
    });
    res.status(201).json({ token: signToken(user), user: userResponse(user) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
    const user = await User.findOne({ email: req.body.email.toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }
    res.json({ token: signToken(user), user: userResponse(user) });
  } catch (error) {
    next(error);
  }
}

export async function guest(req, res, next) {
  try {
    const user = await User.create({
      name: "Guest",
      email: `guest-${randomUUID()}@skillpath.invalid`,
      password: await bcrypt.hash(randomBytes(32).toString("hex"), 12)
    });
    res.status(201).json({ token: signToken(user), user: userResponse(user) });
  } catch (error) {
    next(error);
  }
}

export function me(req, res) {
  res.json({ user: userResponse(req.user) });
}
