import { X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";

import { EXPERIENCE_DURATIONS, type ExperienceDuration } from "@/lib/types";

interface SkillTagInputProps {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  /** when provided, each tag gets an optional per-skill experience duration picker */
  experience?: Record<string, ExperienceDuration>;
  onExperienceChange?: (value: Record<string, ExperienceDuration>) => void;
}

export function SkillTagInput({
  id,
  value,
  onChange,
  placeholder = "Type a skill and press Enter",
  suggestions = [],
  experience,
  onExperienceChange,
}: SkillTagInputProps) {
  const [draft, setDraft] = useState("");
  const perSkill = Boolean(experience && onExperienceChange);

  const add = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
    setDraft("");
  };

  const remove = (tag: string) => {
    onChange(value.filter((v) => v !== tag));
    if (experience && onExperienceChange) {
      const next = { ...experience };
      delete next[tag];
      onExperienceChange(next);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const open = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="space-y-2">
      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-input bg-secondary px-2 py-2">
        {value.map((tag) => (
          <span key={tag} className="skill-chip-on-dark">
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => remove(tag)}
              className="text-muted-foreground transition-colors hover:text-danger"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          placeholder={value.length ? "" : placeholder}
          className="min-w-32 flex-1 bg-transparent px-1 font-mono text-sm text-foreground outline-none placeholder:font-sans placeholder:text-muted-foreground"
        />
      </div>

      {perSkill && value.length > 0 && (
        <div className="space-y-2 rounded-xl border border-border bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">
            Optional: how long have you worked with each skill?
          </p>
          {value.map((tag) => (
            <div key={tag} className="flex items-center gap-2">
              <span className="w-32 shrink-0 truncate font-mono text-xs text-foreground">{tag}</span>
              <select
                aria-label={`Experience with ${tag}`}
                value={experience?.[tag] ?? ""}
                onChange={(e) => {
                  const next = { ...experience };
                  if (e.target.value) next[tag] = e.target.value as ExperienceDuration;
                  else delete next[tag];
                  onExperienceChange?.(next);
                }}
                className="flex-1 rounded-lg border border-input bg-secondary px-2 py-1.5 text-xs text-foreground outline-none focus:border-success"
              >
                <option value="" className="bg-background">
                  Not specified
                </option>
                {EXPERIENCE_DURATIONS.map((d) => (
                  <option key={d} value={d} className="bg-background">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {open.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {open.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="skill-chip-on-dark transition-colors hover:border-success hover:text-success"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const SKILL_SUGGESTIONS = [
  "React",
  "TypeScript",
  "UI Design",
  "UX Design",
  "Data Engineering",
  "ML",
  "Python",
  "Backend",
  "DevOps",
  "Product",
  "SQL",
  "Mobile",
];
