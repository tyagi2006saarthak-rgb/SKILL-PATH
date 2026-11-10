# SkillPath — Skill Gap Analyzer & Career Path Recommender

A full-stack career-planning application built with React, Express, and MongoDB. Students can manage their skills, compare them with role requirements, generate a prioritized learning roadmap, and track their progress over time. Recommendations use transparent, rule-based comparisons; the application does not claim to use AI or predict employment outcomes.

## Features

- Account registration and sign-in with bcrypt password hashing and JWT-protected APIs.
- Private student profiles and CRUD skill management with five proficiency levels.
- Twelve seeded career paths with skill requirements, importance weights, prerequisites, and learning resources.
- Rule-based skill-gap analysis, severity labels, weighted prioritization, and prerequisite-aware roadmap generation.
- Persistent roadmaps and individual learning tasks with pending, in-progress, completed, and percentage progress.
- Dashboard statistics, proficiency/gap/progress charts, activity history, and skill improvement history.
- Responsive interface, light/dark theme, profile management, search/filter, and roadmap history.

## Requirements

- Node.js 20 or newer and npm.
- MongoDB Server running locally, or a MongoDB connection string.

The default database URL is `mongodb://127.0.0.1:27017/skill_gap_analyzer`. The app does not create database credentials or require MongoDB Atlas.

## Setup

From the project root:

1. Install all workspace dependencies:

   ```powershell
   npm install
   ```

2. Create the backend environment file:

   ```powershell
   Copy-Item server\.env.example server\.env
   ```

   Set `JWT_SECRET` in `server\.env` to a long, random value. Update `MONGODB_URI` if your MongoDB server uses a different address. Keep `.env` private; it is ignored by Git.

3. Seed career roles and learning resources:

   ```powershell
   npm run seed
   ```

4. Start the API and React development server:

   ```powershell
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173). The API listens at [http://localhost:5000](http://localhost:5000); `GET /api/health` is its health check.

Register with your name, email, and password, or sign in to an existing account. Passwords are hashed before they are stored in MongoDB; the original password is never stored.

## Deploy for access across devices

For changes to appear on every device, deploy the frontend and API and point the API at a hosted MongoDB database. This project can use Vercel for the frontend, Render for the API, and MongoDB Atlas for the database.

1. Push the project to a Git provider such as GitHub. Create a MongoDB Atlas cluster and database user, then add the Render service's outbound IP access (or, if the Render plan does not provide fixed outbound IPs, allow `0.0.0.0/0` and use a strong database password). Copy the Atlas connection string for the `skill_gap_analyzer` database.
2. In Render, create a **Web Service** from the repository with:
   - Root directory: repository root
   - Build command: `npm ci`
   - Start command: `npm run start --workspace server`
   - Environment variables: `MONGODB_URI` (the Atlas connection string), `JWT_SECRET` (a long random secret), and `CLIENT_URL` (the Vercel site origin, with no trailing slash)
3. In Vercel, import the same repository with:
   - Root directory: repository root
   - Build command: `npm run build --workspace client`
   - Output directory: `client/dist`
   - Environment variable: `VITE_API_URL` set to the Render service URL followed by `/api` (for example, `https://your-api.onrender.com/api`)
   The root `vercel.json` configures client-side routes to load correctly.
4. After the first Vercel deployment, set `CLIENT_URL` in Render to the exact Vercel origin, redeploy the API, and open the Vercel URL. Register an account there. Local MongoDB data is not automatically copied to Atlas.

Account information and app data are stored in MongoDB and associated with the signed-in user. Keep `MONGODB_URI` and `JWT_SECRET` private; never put them in the frontend or commit them to the repository.

## Useful commands

```powershell
npm run build
npm run seed
npm test --workspace server
npm run start --workspace server
npm run dev --workspace client
```

If running the client and API separately, set `VITE_API_URL` in the client environment to the API base URL (for example `http://localhost:5000/api`). The API's `CLIENT_URL` must match the browser origin.

## Project structure

```text
client/
  src/
    components/     Navigation, route protection, and layout
    context/        Authentication state
    pages/          Dashboard, skills, careers, roadmap, progress, profile, auth
    services/       Axios API client
    styles.css      Responsive light/dark application styling
server/
  config/           MongoDB connection
  controllers/      Auth, profile, skills, analysis, roadmaps, progress
  middleware/       JWT authentication and error handling
  models/           User, skill, career, roadmap, task, resource, activity
  routes/           REST API routes
  seed/             Career roles and learning resources
  services/         Gap analysis and roadmap ordering
```

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET|POST /api/skills`, `PUT|DELETE /api/skills/:id`
- `GET /api/careers`, `GET /api/careers/:id`, `POST /api/analysis/:id`
- `POST /api/roadmaps/generate`, `GET /api/roadmaps`, `GET /api/roadmaps/:id`
- `PUT /api/roadmaps/:roadmapId/tasks/:taskId/status`, `DELETE /api/roadmaps/:roadmapId/tasks/:taskId`
- `GET /api/dashboard/stats`, `GET /api/progress`
- `GET|PUT /api/profile`

All endpoints other than registration, login, and health check require `Authorization: Bearer <token>`. User-owned data is queried with the authenticated user ID.

## Recommendation rules

Skill levels are integers from 1 (Beginner) to 5 (Expert). A missing skill has level 0. Gap is `max(0, required level - current level)`; gap 0 is achieved, gap 1 low, gap 2 medium, gap 3 high, and gap 4 or more critical. Learning tasks are ordered with configured prerequisites first, then by gap multiplied by the role's importance weight. Estimated duration is four hours per gap level, with a two-hour minimum. Role requirements and resource links are curated seed data and should be reviewed before being used as career guidance.
