export type ExperienceDuration =
  | "No prior experience"
  | "Less than 3 months"
  | "3–6 months"
  | "6–12 months"
  | "1–2 years"
  | "2–3 years"
  | "3+ years";

export const EXPERIENCE_DURATIONS: ExperienceDuration[] = [
  "No prior experience",
  "Less than 3 months",
  "3–6 months",
  "6–12 months",
  "1–2 years",
  "2–3 years",
  "3+ years",
];

/** approximate midpoint in months, used for objective experience comparison */
export const EXPERIENCE_MONTHS: Record<ExperienceDuration, number> = {
  "No prior experience": 0,
  "Less than 3 months": 1.5,
  "3–6 months": 4.5,
  "6–12 months": 9,
  "1–2 years": 18,
  "2–3 years": 30,
  "3+ years": 48,
};

export const MAX_EXPERIENCE_MONTHS = 48;

export function experienceMonths(value: ExperienceDuration | undefined): number {
  return value ? (EXPERIENCE_MONTHS[value] ?? 0) : 0;
}

/** "Python: 1–2 years" style label */
export function formatSkillExperience(skill: string, value: ExperienceDuration | undefined): string {
  return value ? `${skill}: ${value}` : skill;
}

export type Availability = "< 5 hrs/week" | "5-10 hrs/week" | "10-20 hrs/week" | "20+ hrs/week";

export const AVAILABILITIES: Availability[] = [
  "< 5 hrs/week",
  "5-10 hrs/week",
  "10-20 hrs/week",
  "20+ hrs/week",
];

export type ProjectType =
  | "Hackathon"
  | "Startup"
  | "Research"
  | "Competition"
  | "Open Source"
  | "Freelance-style";

export const PROJECT_TYPES: ProjectType[] = [
  "Hackathon",
  "Startup",
  "Research",
  "Competition",
  "Open Source",
  "Freelance-style",
];

export const DURATIONS = ["1 week", "1 month", "3 months", "Ongoing"];

export interface User {
  id: string;
  name: string;
  skills: string[];
  interests: string[];
  availability: Availability;
  /** how long they have worked with their listed skills overall */
  experience: ExperienceDuration;
  /** optional per-skill experience duration, keyed by skill name */
  skillExperience?: Record<string, ExperienceDuration>;
  projectTypesInterested: ProjectType[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  leaderName: string;
  /** leader's experience relevant to this project */
  leaderExperience: ExperienceDuration;
  requiredSkills: string[];
  teamSize: number;
  duration: string;
  location: string;
  remoteOk: boolean;
  additionalInfo?: string;
  projectType?: ProjectType;
}

export type InviteDirection = "leader_to_candidate" | "candidate_to_leader";
export type InviteStatus = "pending" | "accepted" | "declined";

export interface Invite {
  id: string;
  projectId: string;
  userId: string;
  direction: InviteDirection;
  status: InviteStatus;
}
