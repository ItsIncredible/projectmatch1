import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Users } from "lucide-react";
import { useState } from "react";

import { useStore } from "@/lib/store";

export function TopBar() {
  const { projects, users, session, setSession } = useStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const current =
    session?.role === "leader"
      ? projects.find((p) => p.id === session.id)?.title
      : users.find((u) => u.id === session?.id)?.name;

  const pick = (role: "leader" | "candidate", id: string) => {
    setSession({ role, id });
    setOpen(false);
    navigate({ to: role === "leader" ? "/leader" : "/candidate" });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-success text-success-foreground">
            <Users className="size-4" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">ProjectMatch</span>
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <span className="max-w-40 truncate">{current ?? "Switch view"}</span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-secondary p-2 text-sm">
              <p className="px-2 py-1 font-mono text-xs uppercase text-muted-foreground">Lead a project</p>
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pick("leader", p.id)}
                  className="block w-full truncate rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent"
                >
                  {p.title}
                  <span className="text-muted-foreground"> · {p.leaderName}</span>
                </button>
              ))}
              <p className="mt-2 px-2 py-1 font-mono text-xs uppercase text-muted-foreground">
                Candidate profiles
              </p>
              <div className="max-h-56 overflow-y-auto">
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => pick("candidate", u.id)}
                    className="block w-full truncate rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent"
                  >
                    {u.name}
                    <span className="text-muted-foreground"> · {u.experienceLevel}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
