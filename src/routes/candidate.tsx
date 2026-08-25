import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DeckEmpty, Initials, MatchBadge, SwipeCard } from "@/components/SwipeCard";
import { rankProjects } from "@/lib/scoring";
import { formatSkillExperience } from "@/lib/types";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/candidate")({
  head: () => ({
    meta: [
      { title: "Candidate dashboard — ProjectMatch" },
      {
        name: "description",
        content:
          "Respond to invites, swipe through projects ranked against your skills, and track the teams you've joined.",
      },
      { property: "og:title", content: "Candidate dashboard — ProjectMatch" },
      {
        property: "og:description",
        content: "Invites, a ranked project deck, and your joined teams in one place.",
      },
    ],
  }),
  component: CandidateDashboard,
});

type Tab = "invites" | "discover" | "teams";

function CandidateDashboard() {
  const {
    users,
    projects,
    invites,
    session,
    hydrated,
    createInvite,
    setInviteStatus,
    skippedProjects,
    skipProject,
  } = useStore();
  const [tab, setTab] = useState<Tab>("invites");

  const user = users.find((u) => u.id === session?.id);

  const myInvites = useMemo(
    () =>
      user
        ? invites.filter(
            (i) => i.userId === user.id && i.direction === "leader_to_candidate" && i.status === "pending",
          )
        : [],
    [invites, user],
  );

  const myTeams = useMemo(
    () =>
      user
        ? invites
            .filter((i) => i.userId === user.id && i.status === "accepted")
            .map((i) => projects.find((p) => p.id === i.projectId))
            .filter((p): p is NonNullable<typeof p> => Boolean(p))
        : [],
    [invites, projects, user],
  );

  const deck = useMemo(() => {
    if (!user) return [];
    const excluded = new Set([
      ...invites.filter((i) => i.userId === user.id && i.status !== "declined").map((i) => i.projectId),
      ...(skippedProjects[user.id] ?? []),
    ]);
    return rankProjects(
      projects.filter((p) => !excluded.has(p.id)),
      user,
    );
  }, [user, projects, invites, skippedProjects]);

  if (!hydrated) return <div className="px-4 py-16 text-sm text-muted-foreground">Loading…</div>;

  if (!user || session?.role !== "candidate") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">No profile selected</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a profile, or pick one from the switcher in the top bar.
        </p>
        <Link
          to="/join"
          className="mt-6 inline-flex rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground"
        >
          Build my profile
        </Link>
      </div>
    );
  }

  const top = deck[0];
  const tabs: { key: Tab; label: string }[] = [
    { key: "invites", label: `Invites (${myInvites.length})` },
    { key: "discover", label: "Discover Projects" },
    { key: "teams", label: `My Teams (${myTeams.length})` },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <h1 className="font-display text-2xl font-bold">{user.name}</h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        {user.experience} experience · {user.availability}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {user.skills.map((s) => (
          <span key={s} className="skill-chip-on-dark">
            {formatSkillExperience(s, user.skillExperience?.[s])}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-success text-success-foreground" : "bg-secondary hover:bg-accent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "invites" && (
        <section className="mt-6 space-y-3">
          {myInvites.length === 0 && (
            <p className="text-sm text-muted-foreground">No invites yet — try Discover Projects.</p>
          )}
          {myInvites.map((invite) => {
            const project = projects.find((p) => p.id === invite.projectId);
            if (!project) return null;
            return (
              <div key={invite.id} className="badge-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold">{project.title}</p>
                    <p className="font-mono text-xs text-surface-foreground/60">
                      {project.leaderName} · {project.leaderExperience} relevant experience ·{" "}
                      {project.duration}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInviteStatus(invite.id, "accepted");
                        toast.success(`You joined ${project.title}`);
                      }}
                      className="rounded-xl bg-success px-3 py-2 text-sm font-semibold text-success-foreground"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteStatus(invite.id, "declined")}
                      className="rounded-xl border border-danger/50 px-3 py-2 text-sm font-semibold text-danger"
                    >
                      Decline
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.requiredSkills.map((s) => (
                    <span key={s} className="skill-chip">{s}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {tab === "discover" && (
        <section className="mt-6">
          {top ? (
            <SwipeCard
              key={top.project.id}
              acceptLabel="Request to join"
              skipLabel="Skip"
              onAccept={() => {
                createInvite({
                  projectId: top.project.id,
                  userId: user.id,
                  direction: "candidate_to_leader",
                });
                toast.success(`Request sent to ${top.project.leaderName}`);
              }}
              onSkip={() => skipProject(user.id, top.project.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl font-bold">{top.project.title}</p>
                  <p className="font-mono text-xs text-surface-foreground/60">
                    {top.project.leaderName} · {top.project.leaderExperience} experience ·{" "}
                    {top.project.duration} · {top.project.location}
                  </p>
                </div>
                <MatchBadge percent={top.percent} />
              </div>

              <p className="mt-4 text-sm text-surface-foreground/80">{top.project.description}</p>

              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-surface-foreground/60">
                Your matching skills
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(top.matchedSkills.length ? top.matchedSkills.slice(0, 3) : ["no_overlap_yet"]).map((s) => (
                  <span
                    key={s}
                    className="skill-chip border-success/50 bg-success/15 text-surface-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-surface-foreground/60">
                Needs
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {top.project.requiredSkills.map((s) => (
                  <span key={s} className="skill-chip">{s}</span>
                ))}
              </div>
            </SwipeCard>
          ) : (
            <DeckEmpty message="No more matches right now — check back as more projects are posted." />
          )}
        </section>
      )}

      {tab === "teams" && (
        <section className="mt-6 space-y-3">
          {myTeams.length === 0 && (
            <p className="text-sm text-muted-foreground">You haven't joined a team yet.</p>
          )}
          {myTeams.map((project) => (
            <div key={project.id} className="badge-card flex items-start gap-3 p-4">
              <Initials name={project.title} />
              <div>
                <p className="font-display font-bold">{project.title}</p>
                <p className="font-mono text-xs text-surface-foreground/60">
                  {project.leaderName} · {project.duration} · {project.location}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {project.requiredSkills.map((s) => (
                    <span key={s} className="skill-chip">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
