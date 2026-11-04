const priorityForGap = (gap) => {
  if (gap >= 4) return "Critical";
  if (gap === 3) return "High";
  if (gap === 2) return "Medium";
  if (gap === 1) return "Low";
  return "Achieved";
};

export function analyzeSkills(requiredSkills, userSkills) {
  const currentByName = new Map(userSkills.map((skill) => [skill.name.trim().toLowerCase(), skill.proficiency]));
  return requiredSkills.map((required) => {
    const currentLevel = currentByName.get(required.name.trim().toLowerCase()) || 0;
    const gap = Math.max(0, required.targetLevel - currentLevel);
    const priority = priorityForGap(gap);
    return {
      name: required.name,
      category: required.category,
      currentLevel,
      requiredLevel: required.targetLevel,
      gap,
      importance: required.importance,
      priority,
      priorityScore: gap * required.importance,
      resource: required.resource,
      prerequisites: required.prerequisites || []
    };
  });
}

export function orderRoadmapTasks(gaps) {
  const pending = new Map(gaps.filter((gap) => gap.gap > 0).map((gap) => [gap.name.toLowerCase(), gap]));
  const ordered = [];
  const visited = new Set();
  const visit = (gap) => {
    const key = gap.name.toLowerCase();
    if (visited.has(key)) return;
    visited.add(key);
    for (const prerequisite of gap.prerequisites) {
      const dependency = pending.get(prerequisite.toLowerCase());
      if (dependency) visit(dependency);
    }
    ordered.push(gap);
  };
  [...pending.values()]
    .sort((a, b) => b.priorityScore - a.priorityScore || a.name.localeCompare(b.name))
    .forEach(visit);
  return ordered;
}
