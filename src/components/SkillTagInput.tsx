import { X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";

interface SkillTagInputProps {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export function SkillTagInput({
  id,
  value,
  onChange,
  placeholder = "Type a skill and press Enter",
  suggestions = [],
}: SkillTagInputProps) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
    setDraft("");
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
              onClick={() => onChange(value.filter((v) => v !== tag))}
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
