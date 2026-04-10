import zxcvbn from "zxcvbn";

export type StrengthScore = 0 | 1 | 2 | 3 | 4;

export function analyzePassword(password: string) {
  const res = zxcvbn(password);
  const score = (res.score ?? 0) as StrengthScore;

  const crackTime =
    res.crack_times_display?.offline_slow_hashing_1e4_per_second ||
    res.crack_times_display?.offline_fast_hashing_1e10_per_second ||
    "";

  // zxcvbn provides guesses_log10; convert to bits-ish for a simple indicator
  const bits = typeof res.guesses_log10 === "number" ? res.guesses_log10 * 3.321928094887362 : 0;

  return {
    raw: res,
    score,
    crackTime,
    warning: res.feedback?.warning || "",
    suggestions: (res.feedback?.suggestions || []).filter(Boolean),
    guessesLog10: res.guesses_log10 ?? 0,
    approxBits: bits,
  };
}

export function scoreLabel(score: StrengthScore) {
  switch (score) {
    case 0:
      return "Very weak";
    case 1:
      return "Weak";
    case 2:
      return "Okay";
    case 3:
      return "Strong";
    case 4:
      return "Very strong";
    default:
      return "Unknown";
  }
}

export function scoreColor(score: StrengthScore) {
  switch (score) {
    case 0:
      return { bar: "bg-red-500", glow: "shadow-red-500/30", text: "text-red-700" };
    case 1:
      return { bar: "bg-orange-500", glow: "shadow-orange-500/30", text: "text-orange-700" };
    case 2:
      return { bar: "bg-amber-500", glow: "shadow-amber-500/30", text: "text-amber-700" };
    case 3:
      return { bar: "bg-emerald-500", glow: "shadow-emerald-500/30", text: "text-emerald-700" };
    case 4:
      return { bar: "bg-green-600", glow: "shadow-green-600/30", text: "text-green-700" };
    default:
      return { bar: "bg-slate-400", glow: "shadow-slate-500/20", text: "text-slate-700" };
  }
}
