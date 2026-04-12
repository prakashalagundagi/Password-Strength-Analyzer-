export const defaultRulesConfig = [
  {
    key: "length",
    label: "At least 12 characters",
    test: (pwd) => pwd.length >= 12,
    detail: "Longer passwords are harder to crack",
  },
  {
    key: "uppercase",
    label: "Contains uppercase letter",
    test: (pwd) => /[A-Z]/.test(pwd),
    detail: "Adds complexity to the password",
  },
  {
    key: "lowercase",
    label: "Contains lowercase letter",
    test: (pwd) => /[a-z]/.test(pwd),
    detail: "Adds complexity to the password",
  },
  {
    key: "numbers",
    label: "Contains number",
    test: (pwd) => /\d/.test(pwd),
    detail: "Adds complexity to the password",
  },
  {
    key: "symbols",
    label: "Contains special character",
    test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    detail: "Special characters make passwords much stronger",
  },
  {
    key: "noCommon",
    label: "Not a common password",
    test: (pwd) => !isCommonPassword(pwd),
    detail: "Avoid easily guessable passwords",
  },
];

const commonPasswords = new Set([
  "password", "123456", "123456789", "12345678", "12345", "1234567", "1234567890", "1234",
  "111111", "000000", "123123", "666666", "qwerty", "abc123", "password123", "admin",
  "letmein", "welcome", "monkey", "1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm",
  "iloveyou", "123abc", "password1", "admin123", "root", "toor", "pass", "test"
]);

function isCommonPassword(pwd) {
  const lower = pwd.toLowerCase();
  return commonPasswords.has(lower) || 
         commonPasswords.has(pwd) ||
         lower.length <= 4 ||
         /^(.)\1+$/.test(pwd) || // Repeated characters like "aaaa"
         /^123\d+$/.test(pwd) || // Sequential numbers starting with 123
         /^abc\d+$/.test(lower); // Sequential letters starting with abc
}

export function evaluateRules(password, config) {
  return config.map((rule) => ({
    ...rule,
    ok: rule.test(password),
  }));
}

export function missingRuleHints(password, config) {
  return config
    .filter((rule) => !rule.test(password))
    .map((rule) => rule.detail || rule.label);
}
