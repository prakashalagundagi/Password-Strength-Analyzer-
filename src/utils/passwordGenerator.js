const vowels = "aeiou";
const consonants = "bcdfghjklmnpqrstvwxyz";
const numbers = "0123456789";
const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateWord(minLength = 4, maxLength = 8) {
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let word = "";
  let useVowel = Math.random() < 0.5;
  
  for (let i = 0; i < length; i++) {
    word += randomChoice(useVowel ? vowels : consonants);
    useVowel = !useVowel;
  }
  
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function generateNumber(length = 2) {
  let num = "";
  for (let i = 0; i < length; i++) {
    num += randomChoice(numbers);
  }
  return num;
}

function generateSymbol(length = 1) {
  let sym = "";
  for (let i = 0; i < length; i++) {
    sym += randomChoice(symbols);
  }
  return sym;
}

export function defaultBestPassword(totalLength = 18) {
  const word1Length = Math.floor(totalLength * 0.3);
  const word2Length = Math.floor(totalLength * 0.3);
  const numberLength = Math.floor(totalLength * 0.2);
  const symbolLength = totalLength - word1Length - word2Length - numberLength;
  
  const word1 = generateWord(word1Length - 1, word1Length + 1);
  const word2 = generateWord(word2Length - 1, word2Length + 1);
  const number = generateNumber(numberLength);
  const symbol = generateSymbol(symbolLength);
  
  const parts = [word1, word2, number, symbol];
  
  // Shuffle the parts
  for (let i = parts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }
  
  return parts.join("");
}

export function generateCustomPassword(options = {}) {
  const {
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeSimilar = false,
    excludeAmbiguous = false
  } = options;
  
  let charset = "";
  
  if (includeLowercase) {
    charset += excludeSimilar ? "abcdefghjkmnpqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
  }
  
  if (includeUppercase) {
    charset += excludeSimilar ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }
  
  if (includeNumbers) {
    charset += excludeSimilar ? "23456789" : "0123456789";
  }
  
  if (includeSymbols) {
    charset += excludeAmbiguous ? "!@#$%^&*()_+-=[]{}|;:,.<>?" : "!@#$%^&*()_+-=[]{}|;:,.<>?~`";
  }
  
  if (!charset) {
    throw new Error("At least one character type must be included");
  }
  
  let password = "";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  
  return password;
}
