import { Check, X } from "lucide-react";
import { useRef, useState, type PointerEvent, type ReactNode } from "react";

interface SwipeCardProps {
  children: ReactNode;
  onAccept: () => void;
  onSkip: () => void;
  acceptLabel: string;
  skipLabel: string;
}

/** Draggable card with keyboard/click fallback buttons. */
export function SwipeCard({ children, onAccept, onSkip, acceptLabel, skipLabel }: SwipeCardProps) {
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState<null | "left" | "right">(null);
  const start = useRef<number | null>(null);

  const fly = (dir: "left" | "right") => {
    if (leaving) return;
    setLeaving(dir);
    setDx(dir === "right" ? 600 : -600);
    window.setTimeout(() => {
      setLeaving(null);
      setDx(0);
      dir === "right" ? onAccept() : onSkip();
    }, 220);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (leaving) return;
    start.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (start.current === null) return;
    setDx(e.clientX - start.current);
  };

  const onPointerUp = () => {
    if (start.current === null) return;
    const moved = dx;
    start.current = null;
    if (moved > 110) fly("right");
    else if (moved < -110) fly("left");
    else setDx(0);
  };

  const intent = dx > 40 ? "accept" : dx < -40 ? "skip" : null;

  return (
    <div className="space-y-5">
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: `translateX(${dx}px) rotate(${dx * 0.035}deg)`,
          transition: start.current === null ? "transform 220ms ease-out" : "none",
        }}
        className="relative touch-none select-none"
      >
        <div className="badge-card relative overflow-hidden p-6">
          <span
            aria-hidden
            className={`absolute inset-x-0 top-0 h-1.5 transition-colors ${
              intent === "accept" ? "bg-success" : intent === "skip" ? "bg-danger" : "bg-transparent"
            }`}
          />
          {children}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => fly("left")}
          aria-label={skipLabel}
          className="flex size-14 items-center justify-center rounded-2xl border border-danger/40 bg-danger/10 text-danger transition-colors hover:bg-danger hover:text-danger-foreground"
        >
          <X className="size-6" />
        </button>
        <p className="w-40 text-center font-mono text-xs text-muted-foreground">
          drag or tap · ← {skipLabel} / {acceptLabel} →
        </p>
        <button
          type="button"
          onClick={() => fly("right")}
          aria-label={acceptLabel}
          className="flex size-14 items-center justify-center rounded-2xl border border-success/40 bg-success/10 text-success transition-colors hover:bg-success hover:text-success-foreground"
        >
          <Check className="size-6" />
        </button>
      </div>
    </div>
  );
}

export function MatchBadge({ percent }: { percent: number }) {
  return (
    <span className="rounded-xl bg-amber px-2.5 py-1 font-mono text-sm font-semibold text-amber-foreground">
      {percent}%
    </span>
  );
}

export function DeckEmpty({ message }: { message: string }) {
  return (
    <div className="badge-card p-10 text-center">
      <p className="font-display text-lg font-bold">Deck empty</p>
      <p className="mt-2 text-sm text-surface-foreground/70">{message}</p>
    </div>
  );
}

export function Initials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-surface-foreground/10 font-display text-lg font-bold text-surface-foreground">
      {initials}
    </span>
  );
}
