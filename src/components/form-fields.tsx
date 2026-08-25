import type { ReactNode, SelectHTMLAttributes } from "react";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
        {hint && <span className="ml-2 text-xs font-normal text-muted-foreground">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-input bg-secondary px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-success";

export function Select({
  options,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[] }) {
  return (
    <select {...props} className={inputClass}>
      {options.map((o) => (
        <option key={o} value={o} className="bg-background">
          {o}
        </option>
      ))}
    </select>
  );
}

export function MultiToggle({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(active ? value.filter((v) => v !== o) : [...value, o])}
            aria-pressed={active}
            className={`rounded-xl border px-3 py-1.5 text-sm transition-colors ${
              active
                ? "border-success bg-success/15 text-success"
                : "border-border bg-secondary text-foreground hover:bg-accent"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
