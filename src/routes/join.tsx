import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Field, MultiToggle, Select, inputClass } from "@/components/form-fields";
import { SKILL_SUGGESTIONS, SkillTagInput } from "@/components/SkillTagInput";
import { useStore } from "@/lib/store";
import {
  AVAILABILITIES,
  EXPERIENCE_LEVELS,
  PROJECT_TYPES,
  type Availability,
  type ExperienceLevel,
  type ProjectType,
} from "@/lib/types";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join a team — ProjectMatch" },
      {
        name: "description",
        content:
          "Add your skills, availability and interests to get ranked project matches you can swipe through.",
      },
      { property: "og:title", content: "Join a team — ProjectMatch" },
      {
        property: "og:description",
        content: "Build a skills profile and swipe through projects that actually need what you do.",
      },
    ],
  }),
  component: JoinOnboarding,
});

const INTEREST_SUGGESTIONS = ["Fintech", "Health", "Climate", "Education", "Games", "Infrastructure"];

function JoinOnboarding() {
  const { addUser, setSession } = useStore();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("Intermediate");
  const [availability, setAvailability] = useState<Availability>("5-10 hrs/week");
  const [projectTypesInterested, setProjectTypesInterested] = useState<ProjectType[]>(["Hackathon"]);
  const [interests, setInterests] = useState<string[]>([]);

  const submit = () => {
    if (!name.trim() || skills.length === 0) {
      toast.error("Add your name and at least one skill.");
      return;
    }
    const user = addUser({
      name: name.trim(),
      skills,
      interests,
      availability,
      experienceLevel,
      projectTypesInterested,
    });
    setSession({ role: "candidate", id: user.id });
    toast.success("Profile created — start discovering projects.");
    navigate({ to: "/candidate" });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-10">
      <h1 className="font-display text-3xl font-bold">Join a team</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell us what you can do and how much time you have.
      </p>

      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Field label="Name" htmlFor="name">
          <input
            id="name"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Maya Rodriguez"
          />
        </Field>

        <Field label="Skills" htmlFor="skills" hint="type and press Enter">
          <SkillTagInput
            id="skills"
            value={skills}
            onChange={setSkills}
            suggestions={SKILL_SUGGESTIONS}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Experience level" htmlFor="experience">
            <Select
              id="experience"
              options={EXPERIENCE_LEVELS}
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
            />
          </Field>
          <Field label="Availability" htmlFor="availability">
            <Select
              id="availability"
              options={AVAILABILITIES}
              value={availability}
              onChange={(e) => setAvailability(e.target.value as Availability)}
            />
          </Field>
        </div>

        <Field label="Type of project you're ready to join">
          <MultiToggle
            options={PROJECT_TYPES}
            value={projectTypesInterested}
            onChange={(next) => setProjectTypesInterested(next as ProjectType[])}
          />
        </Field>

        <Field label="Interests" htmlFor="interests" hint="optional domains you care about">
          <SkillTagInput
            id="interests"
            value={interests}
            onChange={setInterests}
            suggestions={INTEREST_SUGGESTIONS}
            placeholder="Fintech, Climate, Health…"
          />
        </Field>

        <button
          type="submit"
          className="w-full rounded-xl bg-success px-4 py-3 font-display text-base font-bold text-success-foreground transition-opacity hover:opacity-90"
        >
          Create profile & discover projects
        </button>
      </form>
    </div>
  );
}
