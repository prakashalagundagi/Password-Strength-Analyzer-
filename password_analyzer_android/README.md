📱 Password Strength Analyzer (Android App)
🧾 Project Overview

A smart Android application that evaluates password strength using advanced entropy analysis and pattern detection. The app provides real-time feedback, crack time estimation, and security suggestions to help users create strong and secure passwords.

✨ Key Features
🔐 1. Password Strength Checker
Evaluates strength: Weak / Medium / Strong
Based on:
Length
Character variety (A-Z, a-z, 0-9, symbols)
Patterns
⏱ 2. Time to Crack Estimation
Calculates how long it would take to break password
Uses:
Brute-force attack models
Real-world cracking speeds

👉 Example:

Weak → seconds
Strong → years
💡 3. Smart Suggestions
Improve weak passwords:
Add symbols
Increase length
Avoid repetition
📖 4. Dictionary Attack Detection
Detects:
Common words (e.g., "password", "123456")
Names, patterns
Warns user if password is predictable
⚙️ Technologies Used
Component	Technology
Language	Java
IDE	Android Studio
Library	zxcvbn
Platform	Android SDK
🧠 Core Logic (IMPORTANT for viva)
🔍 zxcvbn Library
Developed by Dropbox
Analyzes password using:
Pattern matching
Dictionary checks
Entropy calculation

👉 Returns:

Score (0–4)
Crack time
Feedback
🏗️ System Architecture
User Input → zxcvbn Analyzer → Score Calculation
        ↓
  Strength Level + Crack Time + Suggestions
        ↓
        UI Display
📱 UI Modules
🖥 Main Screen
Password input field
Strength meter (progress bar)
📊 Result Section
Strength level
Time to crack
Feedback messages
🔥 Sample Code (Basic Integration)
Zxcvbn zxcvbn = new Zxcvbn();
Strength strength = zxcvbn.measure(password);

int score = strength.getScore();
String crackTime = strength.getCrackTimesDisplay().getOfflineSlowHashing1e4PerSecond();
String feedback = strength.getFeedback().getWarning();
📈 Advantages
Real-time feedback
User-friendly UI
Prevents weak passwords
Improves security awareness
⚠️ Limitations
Depends on zxcvbn database
Offline only (no live attack simulation)
🚀 Future Enhancements
Add biometric authentication
Password generator
Cloud sync
Multi-language support
