import { useState, useCallback } from "react";

const COMMON_PASSWORDS = [
  "123456", "password", "qwerty", "abc123", "admin",
  "letmein", "monkey", "1234567890", "iloveyou", "sunshine",
  "princess", "dragon", "welcome", "shadow", "master",
  "654321", "superman", "michael", "football", "pass123",
];

const CHAR_SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "@#$%!^&*()-_=+[]{}|;:,.<>?",
};

function generatePassword(length: number): string {
  const all = CHAR_SETS.upper + CHAR_SETS.lower + CHAR_SETS.digits + CHAR_SETS.symbols;
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  let pwd = "";
  // Ensure at least one of each type
  const guaranteed = [
    CHAR_SETS.upper[array[0] % CHAR_SETS.upper.length],
    CHAR_SETS.lower[array[1] % CHAR_SETS.lower.length],
    CHAR_SETS.digits[array[2] % CHAR_SETS.digits.length],
    CHAR_SETS.symbols[array[3] % CHAR_SETS.symbols.length],
  ];
  for (let i = 4; i < length; i++) {
    pwd += all[array[i] % all.length];
  }
  const combined = [...guaranteed, ...pwd.split("")];
  // Shuffle
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.join("");
}

interface AnalysisResult {
  score: number; // 0–4
  label: string;
  color: string;
  barColor: string;
  crackTime: string;
  suggestions: string[];
  isCommon: boolean;
  entropy: number;
  length: number;
  hasUpper: boolean;
  hasLower: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
}

function analyzePassword(password: string): AnalysisResult {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const length = password.length;

  // Entropy calculation
  let charsetSize = 0;
  if (hasUpper) charsetSize += 26;
  if (hasLower) charsetSize += 26;
  if (hasDigit) charsetSize += 10;
  if (hasSymbol) charsetSize += 32;
  const entropy = charsetSize > 0 ? Math.log2(Math.pow(charsetSize, length)) : 0;

  const isCommon = COMMON_PASSWORDS.includes(password.toLowerCase());

  // Score calculation (0–4)
  let score = 0;
  if (length >= 8) score++;
  if (length >= 12) score++;
  if ((hasUpper ? 1 : 0) + (hasLower ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSymbol ? 1 : 0) >= 3) score++;
  if (entropy > 50) score++;
  if (isCommon) score = Math.max(0, score - 2);

  score = Math.min(4, Math.max(0, score));

  // Labels
  const labels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];
  const barColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"];

  // Crack time estimate
  const guessesPerSecond = 1e10; // modern GPU
  const combinations = charsetSize > 0 ? Math.pow(charsetSize, length) : 1;
  const seconds = combinations / guessesPerSecond;
  const crackTime = formatCrackTime(seconds);

  // Suggestions
  const suggestions: string[] = [];
  if (length < 8) suggestions.push("Use at least 8 characters.");
  if (length < 12) suggestions.push("Consider using 12+ characters for better security.");
  if (!hasUpper) suggestions.push("Add uppercase letters (A-Z).");
  if (!hasLower) suggestions.push("Add lowercase letters (a-z).");
  if (!hasDigit) suggestions.push("Add numbers (0-9).");
  if (!hasSymbol) suggestions.push("Add special characters (@, #, $, %, etc.).");
  if (isCommon) suggestions.push("Avoid commonly used passwords.");
  if (suggestions.length === 0) suggestions.push("Great password! Keep it safe.");

  return {
    score,
    label: labels[score],
    color: colors[score],
    barColor: barColors[score],
    crackTime,
    suggestions,
    isCommon,
    entropy: Math.round(entropy),
    length,
    hasUpper,
    hasLower,
    hasDigit,
    hasSymbol,
  };
}

function formatCrackTime(seconds: number): string {
  if (seconds < 1) return "Less than a second";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
  if (seconds < 1e9) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 1e12) return `${(seconds / 31536000).toExponential(1)} years`;
  return "Centuries+";
}

const scoreEmoji = ["💀", "😟", "😐", "😊", "🛡️"];
const scoreGlow = [
  "shadow-red-500/40",
  "shadow-orange-500/40",
  "shadow-yellow-500/40",
  "shadow-green-500/40",
  "shadow-emerald-500/40",
];

export default function App() {
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [pwdLength, setPwdLength] = useState(14);

  const handleCheck = useCallback(() => {
    if (!password.trim()) return;
    setResult(analyzePassword(password));
    setGenerated(false);
  }, [password]);

  const handleGenerate = useCallback(() => {
    const pwd = generatePassword(pwdLength);
    setPassword(pwd);
    setResult(analyzePassword(pwd));
    setGenerated(true);
    setCopied(false);
  }, [pwdLength]);

  const handleCopy = useCallback(() => {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [password]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCheck();
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 flex flex-col items-center justify-start py-10 px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">🔐</div>
        <h1 className="text-4xl font-black text-white tracking-tight">
          Password <span className="text-cyan-400">Analyzer</span>
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          Check password strength & generate secure passwords
        </p>
      </div>

      {/* Main Card */}
      <div
        className={`w-full max-w-lg bg-gray-900 border border-slate-700 rounded-3xl p-7 shadow-2xl transition-all duration-500 ${
          result ? `shadow-xl ${scoreGlow[result.score]}` : ""
        }`}
      >
        {/* Password Input */}
        <label className="block text-slate-300 text-sm font-semibold mb-2">
          Enter Password
        </label>
        <div className="relative mb-4">
          <input
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setResult(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your password..."
            className="w-full bg-slate-800 text-white placeholder-slate-500 border border-slate-600 rounded-xl px-4 py-3 pr-24 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          />
          {/* Show/Hide Toggle */}
          <button
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition text-xs font-semibold select-none"
            title={showPwd ? "Hide password" : "Show password"}
          >
            {showPwd ? "🙈 Hide" : "👁️ Show"}
          </button>
        </div>

        {/* Strength bar (live as user types) */}
        {password.length > 0 && (() => {
          const live = analyzePassword(password);
          return (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400">Strength</span>
                <span className="text-xs font-semibold" style={{ color: live.color }}>
                  {scoreEmoji[live.score]} {live.label}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${live.barColor}`}
                  style={{ width: `${(live.score / 4) * 100}%` }}
                />
              </div>
            </div>
          );
        })()}

        {/* Generator Controls */}
        <div className="mb-5">
          <label className="block text-slate-300 text-sm font-semibold mb-2">
            Password Length: <span className="text-cyan-400">{pwdLength}</span>
          </label>
          <input
            type="range"
            min={8}
            max={32}
            value={pwdLength}
            onChange={(e) => setPwdLength(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>8</span>
            <span>32</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={handleCheck}
            disabled={!password.trim()}
            className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-bold py-3 rounded-xl transition text-sm"
          >
            🔍 Analyze
          </button>
          <button
            onClick={handleGenerate}
            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition text-sm"
          >
            ⚡ Generate
          </button>
          <button
            onClick={handleCopy}
            disabled={!password}
            className="px-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition text-sm"
            title="Copy to clipboard"
          >
            {copied ? "✅" : "📋"}
          </button>
        </div>

        {/* Generated badge */}
        {generated && (
          <div className="mb-4 text-center text-xs text-purple-400 font-semibold animate-pulse">
            ✨ Secure password generated! Don't forget to save it.
          </div>
        )}

        {/* Analysis Result */}
        {result && (
          <div className="mt-2 space-y-4 animate-fadeIn">
            {/* Score Banner */}
            <div
              className="rounded-2xl p-4 text-center border"
              style={{
                backgroundColor: result.color + "18",
                borderColor: result.color + "55",
              }}
            >
              <div className="text-3xl mb-1">{scoreEmoji[result.score]}</div>
              <div className="text-xl font-black" style={{ color: result.color }}>
                {result.label}
              </div>
              <div className="text-slate-400 text-xs mt-1">
                ⏱ Estimated crack time:{" "}
                <span className="text-white font-semibold">{result.crackTime}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Length" value={`${result.length} chars`} icon="📏" />
              <StatCard label="Entropy" value={`${result.entropy} bits`} icon="🎲" />
              <StatCard
                label="Character Types"
                value={`${[result.hasUpper, result.hasLower, result.hasDigit, result.hasSymbol].filter(Boolean).length} / 4`}
                icon="🔣"
              />
              <StatCard
                label="Common Password"
                value={result.isCommon ? "Yes ⚠️" : "No ✅"}
                icon="📋"
                danger={result.isCommon}
              />
            </div>

            {/* Character Type Checklist */}
            <div className="bg-slate-800 rounded-2xl p-4">
              <p className="text-slate-300 text-sm font-semibold mb-3">Character Composition</p>
              <div className="grid grid-cols-2 gap-2">
                <CheckItem label="Uppercase (A-Z)" ok={result.hasUpper} />
                <CheckItem label="Lowercase (a-z)" ok={result.hasLower} />
                <CheckItem label="Numbers (0-9)" ok={result.hasDigit} />
                <CheckItem label="Symbols (@#$%)" ok={result.hasSymbol} />
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-slate-800 rounded-2xl p-4">
              <p className="text-slate-300 text-sm font-semibold mb-3">💡 Suggestions</p>
              <ul className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-0.5">
                      {s.startsWith("Great") ? "✅" : "•"}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Password Warning */}
            {result.isCommon && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4 text-sm text-red-400 font-semibold text-center">
                ⚠️ This password is in the list of commonly used passwords. Change it immediately!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tips Footer */}
      <div className="mt-8 w-full max-w-lg bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
        <p className="text-cyan-400 font-bold text-sm mb-3">🔑 Password Security Tips</p>
        <ul className="text-slate-400 text-xs space-y-1.5">
          <li>✦ Use a unique password for every account</li>
          <li>✦ Never share passwords via email or text</li>
          <li>✦ Consider using a password manager</li>
          <li>✦ Enable two-factor authentication (2FA) when possible</li>
          <li>✦ Change passwords regularly, especially after a breach</li>
        </ul>
      </div>

      <p className="mt-6 text-slate-600 text-xs">
        Passwords are analyzed locally — nothing is sent to any server.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  danger,
}: {
  label: string;
  value: string;
  icon: string;
  danger?: boolean;
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-3 flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className={`text-sm font-bold ${danger ? "text-red-400" : "text-white"}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={ok ? "text-green-400" : "text-slate-600"}>
        {ok ? "✅" : "❌"}
      </span>
      <span className={ok ? "text-slate-300" : "text-slate-500"}>{label}</span>
    </div>
  );
}
