import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Sparkles, MousePointerClick } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProjectMatch — Find your team. Build what's next." },
      {
        name: "description",
        content:
          "Match project leaders with teammates by skills, availability and experience. Swipe through ranked candidates and projects to build your team.",
      },
      { property: "og:title", content: "ProjectMatch — Find your team. Build what's next." },
      {
        property: "og:description",
        content:
          "Swipe-based team formation for hackathons, competitions, research and startups. Ranked matches on skills, availability and interests.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    icon: ClipboardList,
    title: "Post or profile",
    body: "Leaders post a project with required skills. Candidates build a skills profile.",
  },
  {
    icon: Sparkles,
    title: "Get ranked matches",
    body: "We score every pair on matching skills, availability fit and shared interests.",
  },
  {
    icon: MousePointerClick,
    title: "Swipe to connect",
    body: "Right to invite or request, left to skip. Accepted matches join the team instantly.",
  },
];

function Landing() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-16">
      <p className="skill-chip-on-dark">team_formation</p>
      <h1 className="mt-5 font-display text-5xl font-bold leading-tight sm:text-6xl">ProjectMatch</h1>
      <p className="mt-3 max-w-xl text-lg text-muted-foreground">Find your team. Build what's next.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          to="/lead"
          className="badge-card group flex flex-col justify-between p-6 transition-transform hover:-translate-y-0.5"
        >
          <span className="font-display text-2xl font-bold">I'm leading a project</span>
          <span className="mt-6 text-sm text-surface-foreground/70">
            Post what you're building, then swipe ranked candidates and send invites.
          </span>
          <span className="mt-5 inline-flex w-fit rounded-xl bg-success px-4 py-2 text-sm font-semibold text-success-foreground">
            Create a project →
          </span>
        </Link>

        <Link
          to="/join"
          className="badge-card group flex flex-col justify-between p-6 transition-transform hover:-translate-y-0.5"
        >
          <span className="font-display text-2xl font-bold">I want to join a team</span>
          <span className="mt-6 text-sm text-surface-foreground/70">
            Add your skills and availability, then swipe projects that actually need you.
          </span>
          <span className="mt-5 inline-flex w-fit rounded-xl bg-surface-foreground px-4 py-2 text-sm font-semibold text-surface">
            Build my profile →
          </span>
        </Link>
      </div>

      <h2 className="mt-16 font-display text-xl font-bold">How matching works</h2>
      <ol className="mt-5 grid gap-4 sm:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className="rounded-2xl border border-border bg-secondary p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-amber text-amber-foreground">
                <step.icon className="size-4" />
              </span>
              <span className="font-mono text-xs text-muted-foreground">step_{i + 1}</span>
            </div>
            <p className="mt-4 font-display text-base font-bold">{step.title}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>

      <p className="mt-10 font-mono text-xs text-muted-foreground">
        score = (matching_skills × 3) + (availability_fit × 2) + (interest_overlap × 1)
      </p>
    </div>
  );
}
