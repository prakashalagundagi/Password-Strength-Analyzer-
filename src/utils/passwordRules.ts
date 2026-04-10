export type PasswordRuleKey =
  | "length"
  | "lower"
  | "upper"
  | "number"
  | "symbol"
  | "noSpaces";

export type PasswordRuleResult = {
  key: PasswordRuleKey;
  label: string;
  ok: boolean;
  detail?: string;
};

export type PasswordRulesConfig = {
  minLength: number;
  requireLower: boolean;
  requireUpper: boolean;
  requireNumber: boolean;
  requireSymbol: boolean;
  disallowSpaces: boolean;
};

export const defaultRulesConfig: PasswordRulesConfig = {
  minLength: 12,
  requireLower: true,
  requireUpper: true,
  requireNumber: true,
  requireSymbol: true,
  disallowSpaces: true,
};

export function evaluateRules(password: string, cfg: PasswordRulesConfig): PasswordRuleResult[] {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9\s]/.test(password);
  const hasSpace = /\s/.test(password);

  const results: PasswordRuleResult[] = [
    {
      key: "length",
      label: `At least ${cfg.minLength} characters`,
      ok: password.length >= cfg.minLength,
      detail: `${password.length}/${cfg.minLength}`,
    },
  ];

  if (cfg.requireLower) results.push({ key: "lower", label: "Contains a lowercase letter", ok: hasLower });
  if (cfg.requireUpper) results.push({ key: "upper", label: "Contains an uppercase letter", ok: hasUpper });
  if (cfg.requireNumber) results.push({ key: "number", label: "Contains a number", ok: hasNumber });
  if (cfg.requireSymbol) results.push({ key: "symbol", label: "Contains a symbol", ok: hasSymbol });
  if (cfg.disallowSpaces)
    results.push({ key: "noSpaces", label: "No spaces", ok: !hasSpace, detail: hasSpace ? "Remove spaces" : undefined });

  return results;
}

export function missingRuleHints(password: string, cfg: PasswordRulesConfig): string[] {
  const rules = evaluateRules(password, cfg);
  return rules
    .filter((r) => !r.ok)
    .map((r) => {
      switch (r.key) {
        case "length":
          return `Make it longer (≥ ${cfg.minLength}).`;
        case "lower":
          return "Add a lowercase letter.";
        case "upper":
          return "Add an uppercase letter.";
        case "number":
          return "Add a number.";
        case "symbol":
          return "Add a symbol (e.g., ! @ # ?).";
        case "noSpaces":
          return "Remove spaces.";
        default:
          return "Improve the password.";
      }
    });
}
