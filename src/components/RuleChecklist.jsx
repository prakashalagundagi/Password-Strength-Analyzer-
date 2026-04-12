import { motion } from "framer-motion";
import { cn } from "../utils/cn";

function CheckIcon({ ok }) {
  return ok ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12" />
    </svg>
  );
}

export function RuleChecklist({ rules, className }) {
  return (
    <div className={cn("grid gap-2", className)}>
      {rules.map((r) => (
        <motion.div
          key={r.key}
          layout
          className={cn(
            "flex items-start gap-3 rounded-xl border bg-white/60 px-3 py-2 backdrop-blur",
            r.ok ? "border-emerald-200" : "border-slate-200"
          )}
        >
          <div className="mt-0.5">
            <CheckIcon ok={r.ok} />
          </div>
          <div className="min-w-0 flex-1">
            <div className={cn("text-sm", r.ok ? "text-slate-800" : "text-slate-700")}>{r.label}</div>
            {r.detail ? <div className="text-xs text-slate-500">{r.detail}</div> : null}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
