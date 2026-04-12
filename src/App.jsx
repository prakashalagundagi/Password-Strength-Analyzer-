import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { RuleChecklist } from "./components/RuleChecklist";
import { StrengthMeter } from "./components/StrengthMeter";
import { cn } from "./utils/cn";
import { defaultBestPassword } from "./utils/passwordGenerator";
import { defaultRulesConfig, evaluateRules, missingRuleHints } from "./utils/passwordRules";
import { analyzePassword, scoreLabel } from "./utils/zxcvbnHelpers";

function LockMark() {
  return (
    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-indigo-200/70 ring-1 ring-white/40">
      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 0 0-8 0v4" />
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2" />
      </svg>
    </div>
  );
}

function IconButton({ label, onClick, children, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm backdrop-blur transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/50 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-xs font-medium text-slate-700 backdrop-blur">
      {children}
    </span>
  );
}

async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
}

export default function App() {
  const rulesCfg = defaultRulesConfig;

  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [suggested, setSuggested] = useState(() => defaultBestPassword(18));

  const analysis = useMemo(() => analyzePassword(password), [password]);
  const rules = useMemo(() => evaluateRules(password, rulesCfg), [password, rulesCfg]);
  const suggestedAnalysis = useMemo(() => analyzePassword(suggested), [suggested]);

  const improvementHints = useMemo(() => {
    const hints = new Set();
    for (const h of missingRuleHints(password, rulesCfg)) hints.add(h);
    for (const s of analysis.suggestions) hints.add(s);
    if (analysis.warning) hints.add(analysis.warning);
    return [...hints];
  }, [analysis.suggestions, analysis.warning, password, rulesCfg]);

  async function handleCopy(text, label) {
    try {
      await copyToClipboard(text);
      alert(`${label} copied!`);
    } catch {
      alert("Copy failed (clipboard blocked)");
    }
  }

  const card = "rounded-3xl border border-slate-200/70 bg-white/60 p-5 shadow-xl shadow-slate-900/5 backdrop-blur ring-1 ring-white/40";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="aurora-bg" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.08) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-4">
            <LockMark />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Password Strength Studio</h1>
              <p className="mt-1 text-sm text-slate-600">Real-time strength check + smart hints &mdash; all client-side.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Pill>Offline</Pill>
            <Pill>No tracking</Pill>
            <Pill>zxcvbn scoring</Pill>
            <Pill>Auto suggestions</Pill>
          </div>
        </motion.header>

        <main className="grid gap-6">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className={cn(card, "card-float")}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Strength checker</h2>
                <p className="mt-1 text-sm text-slate-600">Type a password to get a real-time strength score and fixes.</p>
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-xs text-slate-500">Estimated crack time</div>
                <div className="text-sm font-semibold text-slate-800">{password ? analysis.crackTime || "â\u0080\u0094" : "â\u0080\u0094"}</div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={reveal ? "text" : "password"}
                  placeholder="Enter your passwordâ\u0082¦"
                  className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 pr-28 text-base text-slate-900 shadow-sm outline-none backdrop-blur focus:ring-2 focus:ring-indigo-400/50"
                  autoComplete="new-password"
                  spellCheck={false}
                />
                <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                  <IconButton label={reveal ? "Hide password" : "Show password"} onClick={() => setReveal((v) => !v)}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      {reveal ? (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.88 5.09A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a17.6 17.6 0 0 1-3.34 4.44"
                          />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.1 6.1C3.8 7.7 2 10 2 12c0 0 3 7 10 7a10.3 10.3 0 0 0 3.7-.7" />
                        </>
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                        </>
                      )}
                    </svg>
                    <span className="hidden sm:inline">{reveal ? "Hide" : "Show"}</span>
                  </IconButton>

                  <IconButton label="Copy password" onClick={() => handleCopy(password, "Password")} disabled={!password}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" />
                    </svg>
                    <span className="hidden sm:inline">Copy</span>
                  </IconButton>
                </div>
              </div>

              <StrengthMeter score={analysis.score} />

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white/60 p-3">
                  <div className="text-xs text-slate-500">Quality label</div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">{password ? scoreLabel(analysis.score) : "â\u0080\u0094"}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/60 p-3">
                  <div className="text-xs text-slate-500">Approx. bits</div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">{password ? Math.round(analysis.approxBits) : "â\u0080\u0094"}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/60 p-3">
                  <div className="text-xs text-slate-500">Guesses (log10)</div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">{password ? analysis.guessesLog10.toFixed(1) : "â\u0080\u0094"}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Requirements</h3>
                  <div className="text-xs text-slate-500">Target: strong & unique</div>
                </div>
                <div className="mt-3">
                  <RuleChecklist rules={rules} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900">Smart suggestions</h3>
                  <IconButton
                    label="Use suggested strong password"
                    onClick={() => {
                      setPassword(suggested);
                      alert("Suggested password applied!");
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3 3L22 4" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    <span className="hidden sm:inline">Apply</span>
                  </IconButton>
                </div>

                <div className="mt-3 rounded-2xl border border-slate-200 bg-white/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-slate-500">Suggested strong password</div>
                    <div className="flex items-center gap-2">
                      <Pill>Score: {suggestedAnalysis.score}/4</Pill>
                      <IconButton label="Copy suggested" onClick={() => handleCopy(suggested, "Suggested password")}>
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" />
                        </svg>
                      </IconButton>
                      <IconButton label="Refresh suggestion" onClick={() => setSuggested(defaultBestPassword(18))}>
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-3-6.7" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 3v6h-6" />
                        </svg>
                      </IconButton>
                    </div>
                  </div>
                  <div className="mt-2 break-all rounded-xl bg-slate-900/5 px-3 py-2 font-mono text-sm text-slate-900">{suggested}</div>
                  <div className="mt-2 text-xs text-slate-500">Tip: use a unique password per site. Consider a password manager.</div>
                </div>

                <div className="mt-3 space-y-2">
                  {password ? (
                    improvementHints.length ? (
                      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {improvementHints.slice(0, 6).map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-slate-700">Looks great â\u0080\u0094 strong and hard to guess.</div>
                    )
                  ) : (
                    <div className="text-sm text-slate-600">Start typing to see tailored suggestions.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white/50 p-3 text-xs text-slate-600">
              Privacy: everything happens in your browser. Nothing is sent to a server.
            </div>
          </motion.section>
        </main>

        <footer className="pt-2 text-center text-xs text-slate-500">Built for the web: fast, responsive, and ready to host.</footer>
      </div>

    </div>
  );
}
