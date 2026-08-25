import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DeckEmpty, Initials, MatchBadge, SwipeCard } from "@/components/SwipeCard";
import { rankCandidates, skillExperienceOf, stillNeededSkills } from "@/lib/scoring";
import { formatSkillExperience } from "@/lib/types";
import { useProjectTeam, useStore } from "@/lib/store";

export const Route = createFileRoute("/leader")({
  head: () => ({
    meta: [
      { title: "Leader dashboard — ProjectMatch" },
      {
        name: "description",
        content:
          "Track filled roles, review pending invites and swipe through candidates ranked against your remaining skill gap.",
      },
      { property: "og:title", content: "Leader dashboard — ProjectMatch" },
      {
        property: "og:description",
        content: "Your team, your pending invites, and a gap-aware candidate deck.",
      },
    ],
  }),
  component: LeaderDashboard,
});

function LeaderDashboard() {
  const { projects, users, invites, session, hydrated, createInvite, setInviteStatus, skipped, skipCandidate } =
    useStore();
  const [deckOpen, setDeckOpen] = useState(false);

  const project = projects.find((p) => p.id === session?.id);
  const { accepted, pending } = useProjectTeam(project?.id);

  const needed = useMemo(
    () => (project ? stillNeededSkills(project, accepted) : []),
    [project, accepted],
  );

  const deck = useMemo(() => {
    if (!project) return [];
    const excluded = new Set([
      ...accepted.map((m) => m.id),
      ...pending.map((i) => i.userId),
      ...(skipped[project.id] ?? []),
    ]);
    const pool = users.filter((u) => !excluded.has(u.id));
    // gap-aware: rank against still-needed skills, falling back to the full list
    return rankCandidates(pool, project, needed.length ? needed : project.requiredSkills);
  }, [project, users, accepted, pending, skipped, needed]);

  if (!hydrated) return <div className="px-4 py-16 text-sm text-muted-foreground">Loading…</div>;

  if (!project || session?.role !== "leader") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">No project selected</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a project, or pick one from the switcher in the top bar.
        </p>
        <Link
          to="/lead"
          className="mt-6 inline-flex rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground"
        >
          Post a project
        </Link>
      </div>
    );
  }

  const top = deck[0];
  const filled = accepted.length;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <section className="badge-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">{project.title}</h1>
            <p className="mt-1 font-mono text-xs text-surface-foreground/60">
              {project.duration} · {project.location}
              {project.remoteOk ? " · remote_ok" : ""}
            </p>
          </div>
          <span className="rounded-xl bg-amber px-3 py-1.5 font-mono text-sm font-semibold text-amber-foreground">
            {filled} of {project.teamSize} roles filled
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-surface-foreground/80">{project.description}</p>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-foreground/10">
          <div
            className="h-full rounded-full bg-success transition-all"
            style={{ width: `${Math.min(100, (filled / project.teamSize) * 100)}%` }}
          />
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-surface-foreground/60">
          Still needed
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {needed.length ? (
            needed.map((s) => <span key={s} className="skill-chip">{s}</span>)
          ) : (
            <span className="skill-chip">all_skills_covered</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setDeckOpen((v) => !v)}
          className="mt-6 rounded-xl bg-success px-4 py-2.5 font-display text-sm font-bold text-success-foreground transition-opacity hover:opacity-90"
        >
          {deckOpen ? "Close deck" : "Find Members"}
        </button>
      </section>

      {deckOpen && (
        <section className="mt-8">
          <h2 className="mb-4 font-display text-lg font-bold">Candidate deck</h2>
          {top ? (
            <SwipeCard
              key={top.user.id}
              acceptLabel="Invite"
              skipLabel="Skip"
              onAccept={() => {
                createInvite({
                  projectId: project.id,
                  userId: top.user.id,
                  direction: "leader_to_candidate",
                });
                toast.success(`Invite sent to ${top.user.name}`);
              }}
              onSkip={() => skipCandidate(project.id, top.user.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Initials name={top.user.name} />
                  <div>
                    <p className="font-display text-xl font-bold">{top.user.name}</p>
                    <p className="font-mono text-xs text-surface-foreground/60">
                      {top.user.experience} experience · {top.user.availability}
                    </p>
                  </div>
                </div>
                <MatchBadge percent={top.percent} />
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-surface-foreground/60">
                Top matching skills
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {top.matchedSkills.length ? (
                  top.matchedSkills.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="skill-chip border-success/50 bg-success/15 text-surface-foreground"
                    >
                      {formatSkillExperience(s, skillExperienceOf(top.user, s))}
                    </span>
                  ))
                ) : (
                  <span className="skill-chip">no_gap_overlap</span>
                )}
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-surface-foreground/60">
                Other skills
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {top.user.skills.map((s) => (
                  <span key={s} className="skill-chip">
                    {formatSkillExperience(s, top.user.skillExperience?.[s])}
                  </span>
                ))}
              </div>
            </SwipeCard>
          ) : (
            <DeckEmpty message="No more matches right now — check back as more candidates join." />
          )}
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold">Your Team</h2>
        <div className="mt-3 space-y-3">
          {accepted.length === 0 && (
            <p className="text-sm text-muted-foreground">No members yet — start swiping.</p>
          )}
          {accepted.map((m) => (
            <div key={m.id} className="badge-card flex items-start gap-3 p-4">
              <Initials name={m.name} />
              <div>
                <p className="font-display font-bold">{m.name}</p>
                <p className="font-mono text-xs text-surface-foreground/60">
                  {m.experience} experience · {m.availability}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.skills.map((s) => (
                    <span key={s} className="skill-chip">
                      {formatSkillExperience(s, m.skillExperience?.[s])}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold">Pending Invites</h2>
        <div className="mt-3 space-y-3">
          {pending.length === 0 && <p className="text-sm text-muted-foreground">Nothing pending.</p>}
          {pending.map((invite) => {
            const user = users.find((u) => u.id === invite.userId);
            if (!user) return null;
            const requested = invite.direction === "candidate_to_leader";
            return (
              <div
                key={invite.id}
                className="badge-card flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="flex items-center gap-3">
                  <Initials name={user.name} />
                  <div>
                    <p className="font-display font-bold">{user.name}</p>
                    <p className="font-mono text-xs text-surface-foreground/60">
                      {requested ? "requested_to_join" : "invite_sent"} · {user.experience}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {user.skills.slice(0, 4).map((s) => (
                        <span key={s} className="skill-chip">
                          {formatSkillExperience(s, user.skillExperience?.[s])}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {requested ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInviteStatus(invite.id, "accepted");
                        toast.success(`${user.name} joined the team`);
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
                ) : (
                  <span className="skill-chip">awaiting_response</span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
