package com.example.passwordanalyzer;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

import com.nulabinc.zxcvbn.Zxcvbn;
import com.nulabinc.zxcvbn.Strength;

public class MainActivity extends AppCompatActivity {

    EditText passwordInput;
    Button checkBtn;
    TextView resultText;
    ProgressBar strengthBar;

    Zxcvbn zxcvbn;

    String[] commonPasswords = {
            "123456", "password", "qwerty", "abc123", "admin"
    };

    boolean isCommon(String password) {
        for (String p : commonPasswords) {
            if (p.equals(password)) return true;
        }
        return false;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        passwordInput = findViewById(R.id.passwordInput);
        checkBtn = findViewById(R.id.checkBtn);
        resultText = findViewById(R.id.resultText);
        strengthBar = findViewById(R.id.strengthBar);

        zxcvbn = new Zxcvbn();

        checkBtn.setOnClickListener(view -> {

            String password = passwordInput.getText().toString();

            if (password.isEmpty()) {
                resultText.setText("⚠ Please enter a password");
                return;
            }

            Strength strength = zxcvbn.measure(password);

            int score = strength.getScore();
            String crackTime = strength.getCrackTimesDisplay()
                    .getOfflineSlowHashing1e4PerSecond();

            // Progress bar (0–4 scale → convert to %)
            strengthBar.setProgress(score * 25);

            StringBuilder result = new StringBuilder();

            // Strength level with color
            if (score <= 1) {
                result.append("🔴 Weak Password\n");
                resultText.setTextColor(Color.RED);
            } else if (score == 2) {
                result.append("🟡 Medium Password\n");
                resultText.setTextColor(Color.YELLOW);
            } else {
                result.append("🟢 Strong Password\n");
                resultText.setTextColor(Color.GREEN);
            }

            result.append("\n⏱ Time to crack: ").append(crackTime).append("\n");

            result.append("\n💡 Suggestions:\n");

            if (strength.getFeedback().getSuggestions().isEmpty()) {
                result.append("✔ Great password! No suggestions\n");
            } else {
                for (String s : strength.getFeedback().getSuggestions()) {
                    result.append("• ").append(s).append("\n");
                }
            }

            if (isCommon(password)) {
                result.append("\n⚠ Found in common passwords!");
            }

            resultText.setText(result.toString());
        });
    }
                }
