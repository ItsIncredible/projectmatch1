export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];

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
  experienceLevel: ExperienceLevel;
  projectTypesInterested: ProjectType[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  leaderName: string;
  leaderExperience: ExperienceLevel;
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
