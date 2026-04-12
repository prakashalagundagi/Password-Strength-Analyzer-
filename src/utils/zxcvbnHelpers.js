import zxcvbn from "zxcvbn";

export function analyzePassword(password) {
  const res = zxcvbn(password);
  const score = (res.score ?? 0);

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

export function scoreLabel(score) {
  switch (score) {
    case 0:
      return "Very weak";
    case 1:
      return "Weak";
    case 2:
      return "Fair";
    case 3:
      return "Strong";
    case 4:
      return "Very strong";
    default:
      return "Unknown";
  }
}

export function scoreColor(score) {
  switch (score) {
    case 0:
      return {
        text: "text-red-600",
        bar: "bg-red-500",
        glow: "shadow-red-500/20",
      };
    case 1:
      return {
        text: "text-orange-600",
        bar: "bg-orange-500",
        glow: "shadow-orange-500/20",
      };
    case 2:
      return {
        text: "text-yellow-600",
        bar: "bg-yellow-500",
        glow: "shadow-yellow-500/20",
      };
    case 3:
      return {
        text: "text-emerald-600",
        bar: "bg-emerald-500",
        glow: "shadow-emerald-500/20",
      };
    case 4:
      return {
        text: "text-green-600",
        bar: "bg-green-500",
        glow: "shadow-green-500/20",
      };
    default:
      return {
        text: "text-slate-600",
        bar: "bg-slate-500",
        glow: "shadow-slate-500/20",
      };
  }
}
