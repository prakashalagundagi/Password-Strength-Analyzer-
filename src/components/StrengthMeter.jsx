import { motion } from "framer-motion";
import { cn } from "../utils/cn";
import { scoreColor, scoreLabel } from "../utils/zxcvbnHelpers";

export function StrengthMeter({ score, className }) {
  const pct = ((score + 1) / 5) * 100;
  const colors = scoreColor(score);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className={cn("text-sm font-medium", colors.text)}>{scoreLabel(score)}</div>
        <div className="text-xs text-slate-500">Score {score}/4</div>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200/70 ring-1 ring-slate-900/5">
        <motion.div
          className={cn("absolute inset-y-0 left-0 rounded-full shadow-lg", colors.bar, colors.glow)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
        <div className="pointer-events-none absolute inset-0 flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={cn("h-full flex-1", i === 0 ? "" : "border-l border-white/60")} />
          ))}
        </div>
      </div>
    </div>
  );
}
