import "dotenv/config";
import mongoose from "mongoose";
import CareerRole from "../models/CareerRole.js";
import LearningResource from "../models/LearningResource.js";
import { connectDB } from "../config/db.js";

const resources = {
  HTML: ["MDN HTML", "HTML guides and reference.", "https://developer.mozilla.org/en-US/docs/Learn/HTML"],
  CSS: ["MDN CSS", "CSS tutorials and reference.", "https://developer.mozilla.org/en-US/docs/Learn/CSS"],
  JavaScript: ["MDN JavaScript", "JavaScript learning path and reference.", "https://developer.mozilla.org/en-US/docs/Learn/JavaScript"],
  React: ["React Learn", "Official React learning resources.", "https://react.dev/learn"],
  "Node.js": ["Node.js Docs", "Official Node.js documentation.", "https://nodejs.org/docs/latest/api/"],
  "Express.js": ["Express Guide", "Official Express documentation.", "https://expressjs.com/en/guide/routing.html"],
  MongoDB: ["MongoDB University", "Free MongoDB learning courses.", "https://learn.mongodb.com/"],
  SQL: ["SQL Tutorial", "Interactive SQL tutorial.", "https://www.w3schools.com/sql/"],
  Python: ["Python Tutorial", "Official Python tutorial.", "https://docs.python.org/3/tutorial/"],
  Git: ["Git Book", "The Pro Git book, available online.", "https://git-scm.com/book/en/v2"],
  "REST APIs": ["MDN HTTP", "HTTP and API fundamentals.", "https://developer.mozilla.org/en-US/docs/Web/HTTP"],
  "Data Analysis": ["Pandas Getting Started", "Data analysis with pandas.", "https://pandas.pydata.org/docs/getting_started/"],
  Statistics: ["Khan Academy Statistics", "Introductory statistics lessons.", "https://www.khanacademy.org/math/statistics-probability"],
  "Machine Learning": ["Scikit-learn User Guide", "Practical machine-learning documentation.", "https://scikit-learn.org/stable/user_guide.html"],
  "Data Visualization": ["Plotly Python", "Build clear data visualizations.", "https://plotly.com/python/"],
  "Deep Learning": ["PyTorch Tutorials", "Official PyTorch tutorials.", "https://pytorch.org/tutorials/"],
  "Cloud Computing": ["AWS Cloud Essentials", "Cloud fundamentals learning resources.", "https://aws.amazon.com/training/"],
  Docker: ["Docker Get Started", "Official Docker introduction.", "https://docs.docker.com/get-started/"],
  Kubernetes: ["Kubernetes Basics", "Deploy and manage containerized applications.", "https://kubernetes.io/docs/tutorials/kubernetes-basics/"],
  Linux: ["Linux Journey", "Learn Linux fundamentals.", "https://linuxjourney.com/"],
  Networking: ["Cloudflare Learning", "Networking concepts and explanations.", "https://www.cloudflare.com/learning/network-layer/"],
  Cybersecurity: ["OWASP Top 10", "Learn common web application risks.", "https://owasp.org/www-project-top-ten/"],
  "System Design": ["System Design Primer", "Study scalable system design concepts.", "https://github.com/donnemartin/system-design-primer"],
  "Data Structures": ["Visualgo", "Visualize common data structures and algorithms.", "https://visualgo.net/en"],
  "Problem Solving": ["HackerRank", "Practice programming problem solving.", "https://www.hackerrank.com/domains/algorithms"],
  "Soft Skills": ["Google Technical Writing", "Improve clear technical communication.", "https://developers.google.com/tech-writing"]
};

const roleSpecs = [
  ["Full Stack Developer", "Build end-to-end web applications across frontend, backend, and data layers.", [["HTML",4],["CSS",4],["JavaScript",4],["React",4],["Node.js",4],["Express.js",3],["MongoDB",3],["SQL",3],["Git",3],["REST APIs",4]]],
  ["Frontend Developer", "Create accessible, responsive, and interactive web experiences.", [["HTML",4],["CSS",4],["JavaScript",5],["React",4],["Git",3],["REST APIs",3]]],
  ["Backend Developer", "Design reliable APIs, services, and data-backed application systems.", [["Node.js",4],["Express.js",4],["SQL",4],["MongoDB",3],["REST APIs",5],["Git",3],["System Design",3]]],
  ["Python Developer", "Develop maintainable applications and services using Python.", [["Python",5],["SQL",3],["Git",3],["REST APIs",3],["Data Structures",3]]],
  ["Data Analyst", "Turn structured data into useful insights, reports, and visualizations.", [["SQL",5],["Python",3],["Data Analysis",4],["Statistics",4],["Data Visualization",4]]],
  ["Data Scientist", "Use statistics, code, and machine learning to answer data questions.", [["Python",5],["SQL",4],["Statistics",5],["Data Analysis",4],["Machine Learning",4],["Data Visualization",3]]],
  ["Machine Learning Engineer", "Build, evaluate, and deploy production machine-learning systems.", [["Python",5],["Machine Learning",5],["Deep Learning",4],["SQL",3],["Docker",3],["Cloud Computing",3],["Statistics",4]]],
  ["AI Engineer", "Build applications that use AI models and modern data workflows.", [["Python",5],["Machine Learning",4],["Deep Learning",4],["Cloud Computing",3],["REST APIs",3],["SQL",3]]],
  ["Software Engineer", "Design, implement, test, and maintain software systems.", [["Python",3],["JavaScript",3],["Data Structures",5],["Problem Solving",4],["Git",4],["SQL",3],["System Design",3]]],
  ["DevOps Engineer", "Automate software delivery and operate reliable cloud infrastructure.", [["Linux",4],["Git",4],["Docker",4],["Kubernetes",3],["Cloud Computing",4],["Networking",3]]],
  ["Cybersecurity Analyst", "Identify security risks and help protect systems and data.", [["Networking",4],["Linux",4],["Cybersecurity",5],["Python",3],["Cloud Computing",3]]],
  ["Cloud Engineer", "Design, deploy, and operate services on cloud infrastructure.", [["Cloud Computing",5],["Linux",4],["Networking",4],["Docker",3],["Kubernetes",3],["Git",3],["Python",3]]]
];

const categoryFor = (name) => {
  if (["HTML","CSS","JavaScript","React","Node.js","Express.js","REST APIs"].includes(name)) return "Web Development";
  if (["SQL","MongoDB"].includes(name)) return "Database Management";
  if (["Python","Data Analysis","Statistics","Data Visualization"].includes(name)) return "Data Science";
  if (["Machine Learning","Deep Learning"].includes(name)) return "Artificial Intelligence";
  if (["Cloud Computing","Docker","Kubernetes","Linux"].includes(name)) return "Cloud Computing";
  if (["Cybersecurity","Networking"].includes(name)) return "Cybersecurity";
  if (["Git"].includes(name)) return "Programming Languages";
  if (["Soft Skills"].includes(name)) return "Soft Skills";
  return "Programming Languages";
};

async function seed() {
  await connectDB();
  for (const [skill, [name, description, url]] of Object.entries(resources)) {
    await LearningResource.findOneAndUpdate(
      { name, skill },
      { name, skill, category: categoryFor(skill), description, url },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  for (const [title, description, specs] of roleSpecs) {
    const requiredSkills = specs.map(([name, targetLevel], index) => {
      const [resourceName, resourceDescription, url] = resources[name] || resources["Soft Skills"];
      const previousSkill = index > 0 ? specs[index - 1][0] : null;
      return {
        name,
        category: categoryFor(name),
        targetLevel,
        importance: index < 3 ? 5 : index < 6 ? 4 : 3,
        resource: { name: resourceName, description: resourceDescription, url },
        prerequisites: previousSkill && index % 3 === 0 ? [previousSkill] : []
      };
    });
    await CareerRole.findOneAndUpdate(
      { title },
      { title, description, icon: "briefcase", requiredSkills },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`Seeded ${roleSpecs.length} career roles and ${Object.keys(resources).length} learning resources.`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Could not seed career roles:", error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
