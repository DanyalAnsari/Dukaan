import { STEPS } from "@/constants";

export function ProgressIndicator({ current }: { current: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= current 
                ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" 
                : "bg-muted"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">
        <span>Setup Progress</span>
        <span>{Math.round(((current + 1) / STEPS.length) * 100)}%</span>
      </div>
    </div>
  );
}
