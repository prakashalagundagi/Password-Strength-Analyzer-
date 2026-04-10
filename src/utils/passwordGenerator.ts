export type PasswordGeneratorOptions = {
  length: number;
  lower: boolean;
  upper: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous?: boolean;
};

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUM = "0123456789";
// A curated symbol set that works well across most websites
const SYM = "!@#$%^&*()-_=+[]{};:,.?";

const AMBIGUOUS = new Set(["0", "O", "o", "1", "l", "I", "|", "5", "S"]);

function getCrypto(): Crypto {
  // Browser only (Vite/React app)
  return window.crypto;
}

function randomInt(maxExclusive: number): number {
  // Uniform random int in [0, maxExclusive)
  if (maxExclusive <= 0) return 0;
  const crypto = getCrypto();

  // Rejection sampling to avoid modulo bias
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % maxExclusive);

  const buf = new Uint32Array(1);
  while (true) {
    crypto.getRandomValues(buf);
    const v = buf[0];
    if (v < limit) return v % maxExclusive;
  }
}

function pick(chars: string) {
  return chars[randomInt(chars.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function applyAmbiguousFilter(chars: string, exclude?: boolean) {
  if (!exclude) return chars;
  return [...chars].filter((c) => !AMBIGUOUS.has(c)).join("");
}

export function buildAlphabet(opts: PasswordGeneratorOptions): {
  alphabet: string;
  requiredPools: string[];
} {
  const requiredPools: string[] = [];
  let alphabet = "";

  const lower = opts.lower ? applyAmbiguousFilter(LOWER, opts.excludeAmbiguous) : "";
  const upper = opts.upper ? applyAmbiguousFilter(UPPER, opts.excludeAmbiguous) : "";
  const numbers = opts.numbers ? applyAmbiguousFilter(NUM, opts.excludeAmbiguous) : "";
  const symbols = opts.symbols ? applyAmbiguousFilter(SYM, opts.excludeAmbiguous) : "";

  if (lower) requiredPools.push(lower);
  if (upper) requiredPools.push(upper);
  if (numbers) requiredPools.push(numbers);
  if (symbols) requiredPools.push(symbols);

  alphabet = `${lower}${upper}${numbers}${symbols}`;

  return { alphabet, requiredPools };
}

export function generatePassword(options: PasswordGeneratorOptions): string {
  const length = Math.max(4, Math.min(128, Math.floor(options.length)));

  const { alphabet, requiredPools } = buildAlphabet(options);
  if (!alphabet) {
    // Default to a safe alphabet if user disables all toggles
    return generatePassword({ ...options, lower: true, upper: true, numbers: true, symbols: false });
  }

  const chars: string[] = [];

  // Ensure at least one char from each enabled group
  for (const pool of requiredPools) {
    if (pool.length) chars.push(pick(pool));
  }

  while (chars.length < length) {
    chars.push(pick(alphabet));
  }

  return shuffle(chars).join("");
}

export function defaultBestPassword(length = 18) {
  return generatePassword({
    length,
    lower: true,
    upper: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: true,
  });
}
