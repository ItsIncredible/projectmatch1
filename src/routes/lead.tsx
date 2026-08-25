import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Field, MultiToggle, Select, inputClass } from "@/components/form-fields";
import { SKILL_SUGGESTIONS, SkillTagInput } from "@/components/SkillTagInput";
import { useStore } from "@/lib/store";
import {
  DURATIONS,
  EXPERIENCE_DURATIONS,
  PROJECT_TYPES,
  type ExperienceDuration,
  type ProjectType,
} from "@/lib/types";

export const Route = createFileRoute("/lead")({
  head: () => ({
    meta: [
      { title: "Post a project — ProjectMatch" },
      {
        name: "description",
        content:
          "Describe your project, the skills you need and your team size to start receiving ranked candidate matches.",
      },
      { property: "og:title", content: "Post a project — ProjectMatch" },
      {
        property: "og:description",
        content: "Set up your project in one form and start swiping ranked candidates.",
      },
    ],
  }),
  component: LeadOnboarding,
});

function LeadOnboarding() {
  const { addProject, setSession } = useStore();
  const navigate = useNavigate();

  const [leaderName, setLeaderName] = useState("");
  const [leaderExperience, setLeaderExperience] = useState<ExperienceDuration>("6–12 months");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<string>(DURATIONS[1] ?? "1 month");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState(4);
  const [location, setLocation] = useState("");
  const [remoteOk, setRemoteOk] = useState(true);
  const [projectType, setProjectType] = useState<ProjectType[]>(["Hackathon"]);
  const [additionalInfo, setAdditionalInfo] = useState("");

  const submit = () => {
    if (!leaderName.trim() || !title.trim() || requiredSkills.length === 0) {
      toast.error("Add your name, a project title, and at least one required skill.");
      return;
    }
    const project = addProject({
      title: title.trim(),
      description: description.trim(),
      leaderName: leaderName.trim(),
      leaderExperience,
      requiredSkills,
      teamSize: Math.max(1, teamSize),
      duration,
      location: location.trim() || (remoteOk ? "Remote" : "Not specified"),
      remoteOk,
      additionalInfo: additionalInfo.trim(),
      projectType: projectType[0] ?? "Hackathon",
    });
    setSession({ role: "leader", id: project.id });
    toast.success("Project created — here are your matches.");
    navigate({ to: "/leader" });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-10">
      <h1 className="font-display text-3xl font-bold">Lead a project</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        One form, no passwords. We use your name as a lightweight session.
      </p>

      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Field label="Leader name" htmlFor="leaderName">
          <input
            id="leaderName"
            className={inputClass}
            value={leaderName}
            onChange={(e) => setLeaderName(e.target.value)}
            placeholder="Nora Vance"
          />
        </Field>

        <Field label="How much experience do you have relevant to this project?" htmlFor="leaderExperience">
          <Select
            id="leaderExperience"
            options={EXPERIENCE_DURATIONS}
            value={leaderExperience}
            onChange={(e) => setLeaderExperience(e.target.value as ExperienceDuration)}
          />
        </Field>

        <Field label="Project title" htmlFor="title">
          <input
            id="title"
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="CarbonLedger"
          />
        </Field>

        <Field label="Project description" htmlFor="description">
          <textarea
            id="description"
            rows={4}
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you building, and why now?"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Duration" htmlFor="duration">
            <Select
              id="duration"
              options={DURATIONS}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </Field>
          <Field label="Team size needed" htmlFor="teamSize">
            <input
              id="teamSize"
              type="number"
              min={1}
              max={30}
              className={inputClass}
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
            />
          </Field>
        </div>

        <Field label="Skills required" htmlFor="skills" hint="type and press Enter">
          <SkillTagInput
            id="skills"
            value={requiredSkills}
            onChange={setRequiredSkills}
            suggestions={SKILL_SUGGESTIONS}
          />
        </Field>

        <Field label="Project type">
          <MultiToggle
            options={PROJECT_TYPES}
            value={projectType}
            onChange={(next) => setProjectType(next as ProjectType[])}
          />
        </Field>

        <Field label="Location" htmlFor="location">
          <input
            id="location"
            className={inputClass}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Berlin"
          />
          <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={remoteOk}
              onChange={(e) => setRemoteOk(e.target.checked)}
              className="size-4 accent-[oklch(0.79_0.155_168)]"
            />
            Remote OK
          </label>
        </Field>

        <Field label="Additional information" htmlFor="additional" hint="optional">
          <textarea
            id="additional"
            rows={3}
            className={inputClass}
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Links, meeting expectations, compensation or equity"
          />
        </Field>

        <button
          type="submit"
          className="w-full rounded-xl bg-success px-4 py-3 font-display text-base font-bold text-success-foreground transition-opacity hover:opacity-90"
        >
          Create project & find members
        </button>
      </form>
    </div>
  );
}
