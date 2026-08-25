import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { seedInvites, seedProjects, seedUsers } from "./seed";
import type { Invite, InviteStatus, Project, User } from "./types";

export interface Session {
  role: "leader" | "candidate";
  /** project id when role is leader, user id when role is candidate */
  id: string;
}

interface AppState {
  users: User[];
  projects: Project[];
  invites: Invite[];
  session: Session | null;
  /** candidate ids the leader skipped, keyed by project id */
  skipped: Record<string, string[]>;
  /** project ids the candidate skipped, keyed by user id */
  skippedProjects: Record<string, string[]>;
}

const initialState: AppState = {
  users: seedUsers,
  projects: seedProjects,
  invites: seedInvites,
  session: null,
  skipped: {},
  skippedProjects: {},
};

const STORAGE_KEY = "projectmatch-state-v1";

interface Store extends AppState {
  hydrated: boolean;
  setSession: (session: Session | null) => void;
  addProject: (project: Omit<Project, "id">) => Project;
  addUser: (user: Omit<User, "id">) => User;
  createInvite: (input: Omit<Invite, "id" | "status">) => void;
  setInviteStatus: (id: string, status: InviteStatus) => void;
  skipCandidate: (projectId: string, userId: string) => void;
  skipProject: (userId: string, projectId: string) => void;
}

const StoreContext = createContext<Store | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as AppState) });
    } catch {
      /* ignore corrupt state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state, hydrated]);

  const store = useMemo<Store>(
    () => ({
      ...state,
      hydrated,
      setSession: (session) => setState((s) => ({ ...s, session })),
      addProject: (project) => {
        const created: Project = { ...project, id: `p_${uid()}` };
        setState((s) => ({ ...s, projects: [created, ...s.projects] }));
        return created;
      },
      addUser: (user) => {
        const created: User = { ...user, id: `u_${uid()}` };
        setState((s) => ({ ...s, users: [created, ...s.users] }));
        return created;
      },
      createInvite: (input) =>
        setState((s) => {
          const existing = s.invites.find(
            (i) => i.projectId === input.projectId && i.userId === input.userId && i.status !== "declined",
          );
          if (existing) return s;
          return { ...s, invites: [...s.invites, { ...input, id: `i_${uid()}`, status: "pending" }] };
        }),
      setInviteStatus: (id, status) =>
        setState((s) => ({
          ...s,
          invites: s.invites.map((i) => (i.id === id ? { ...i, status } : i)),
        })),
      skipCandidate: (projectId, userId) =>
        setState((s) => ({
          ...s,
          skipped: { ...s.skipped, [projectId]: [...(s.skipped[projectId] ?? []), userId] },
        })),
      skipProject: (userId, projectId) =>
        setState((s) => ({
          ...s,
          skippedProjects: {
            ...s.skippedProjects,
            [userId]: [...(s.skippedProjects[userId] ?? []), projectId],
          },
        })),
    }),
    [state, hydrated],
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}

export function useProjectTeam(projectId: string | undefined) {
  const { invites, users } = useStore();
  return useMemo(() => {
    if (!projectId) return { accepted: [], pending: [] };
    const forProject = invites.filter((i) => i.projectId === projectId);
    const byId = (id: string) => users.find((u) => u.id === id);
    return {
      accepted: forProject
        .filter((i) => i.status === "accepted")
        .map((i) => byId(i.userId))
        .filter((u): u is User => Boolean(u)),
      pending: forProject.filter((i) => i.status === "pending"),
    };
  }, [invites, users, projectId]);
}
