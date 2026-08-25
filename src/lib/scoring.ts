import type { Availability, ExperienceDuration, Project, User } from "./types";
import { AVAILABILITIES, MAX_EXPERIENCE_MONTHS, experienceMonths } from "./types";

const norm = (s: string) => s.trim().toLowerCase();

export function skillOverlap(a: string[], b: string[]): string[] {
  const set = new Set(b.map(norm));
  return a.filter((s) => set.has(norm(s)));
}

/** availability fit: 0..1, more hours = better fit */
export function availabilityFit(availability: Availability): number {
  const idx = AVAILABILITIES.indexOf(availability);
  return (idx + 1) / AVAILABILITIES.length;
}

/** experience for a single skill: per-skill duration when set, else the overall duration */
export function skillExperienceOf(user: User, skill: string): ExperienceDuration {
  const entry = Object.entries(user.skillExperience ?? {}).find(([k]) => norm(k) === norm(skill));
  return (entry?.[1] as ExperienceDuration | undefined) ?? user.experience;
}

/**
 * Objective, time-based experience compatibility: 0..1.
 * Averages months of experience across the skills that actually matter for the project.
 */
export function experienceFit(user: User, relevantSkills: string[]): number {
  const skills = relevantSkills.length ? skillOverlap(user.skills, relevantSkills) : user.skills;
  const pool = skills.length ? skills : user.skills;
  const months = pool.length
    ? pool.reduce((sum, s) => sum + experienceMonths(skillExperienceOf(user, s)), 0) / pool.length
    : experienceMonths(user.experience);
  return Math.min(1, months / MAX_EXPERIENCE_MONTHS);
}

/** how many of the candidate's interests / project types line up with the project */
export function interestOverlap(user: User, project: Project): number {
  const haystack = norm(
    [project.title, project.description, project.additionalInfo ?? "", project.projectType ?? ""].join(
      " ",
    ),
  );
  let count = user.interests.filter((i) => haystack.includes(norm(i))).length;
  if (project.projectType && user.projectTypesInterested.includes(project.projectType)) count += 1;
  return count;
}

/**
 * Weighted score: (matching skills x 3) + (availability fit x 2) + (experience fit x 2)
 * + (interest overlap x 1). `neededSkills` lets the leader deck re-rank against the
 * *remaining* skill gap.
 */
export function scoreCandidate(user: User, project: Project, neededSkills: string[]) {
  const matched = skillOverlap(user.skills, neededSkills);
  const expFit = experienceFit(user, neededSkills);
  const raw =
    matched.length * 3 +
    availabilityFit(user.availability) * 2 +
    expFit * 2 +
    interestOverlap(user, project);
  const max = Math.max(1, neededSkills.length) * 3 + 2 + 2 + 2;
  return {
    score: raw,
    percent: Math.min(99, Math.max(12, Math.round((raw / max) * 100))),
    matchedSkills: matched,
    experienceFit: expFit,
  };
}

export function rankCandidates(users: User[], project: Project, neededSkills: string[]) {
  return users
    .map((user) => ({ user, ...scoreCandidate(user, project, neededSkills) }))
    .sort((a, b) => b.score - a.score);
}

export function rankProjects(projects: Project[], user: User) {
  return projects
    .map((project) => ({ project, ...scoreCandidate(user, project, project.requiredSkills) }))
    .sort((a, b) => b.score - a.score);
}

/** required skills minus skills already covered by accepted members */
export function stillNeededSkills(project: Project, acceptedMembers: User[]): string[] {
  const covered = new Set(acceptedMembers.flatMap((m) => m.skills.map(norm)));
  return project.requiredSkills.filter((s) => !covered.has(norm(s)));
}
