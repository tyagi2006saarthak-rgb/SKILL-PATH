import { describe, expect, it } from "vitest";
import { analyzeSkills, orderRoadmapTasks } from "./analysis.js";

describe("skill gap analysis", () => {
  const required = [
    { name: "HTML", category: "Web", targetLevel: 4, importance: 5, resource: {}, prerequisites: [] },
    { name: "React", category: "Web", targetLevel: 5, importance: 4, resource: {}, prerequisites: ["HTML"] }
  ];

  it("uses zero for missing skills and prioritizes by weighted gap", () => {
    const result = analyzeSkills(required, [{ name: "HTML", proficiency: 3 }]);
    expect(result.map(({ gap, priority, priorityScore }) => [gap, priority, priorityScore])).toEqual([
      [1, "Low", 5],
      [5, "Critical", 20]
    ]);
  });

  it("puts prerequisites before dependent learning tasks", () => {
    const gaps = analyzeSkills(required, []);
    expect(orderRoadmapTasks(gaps).map((gap) => gap.name)).toEqual(["HTML", "React"]);
  });
});
