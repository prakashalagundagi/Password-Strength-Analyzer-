package com.example.passwordanalyzer;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.*;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.textfield.TextInputEditText;
import com.nulabinc.zxcvbn.Strength;
import com.nulabinc.zxcvbn.Zxcvbn;

public class MainActivity extends AppCompatActivity {

    TextInputEditText passwordInput;
    Button checkBtn;
    TextView strengthLabel, crackTime, suggestions;
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
        strengthLabel = findViewById(R.id.strengthLabel);
        crackTime = findViewById(R.id.crackTime);
        suggestions = findViewById(R.id.suggestions);
        strengthBar = findViewById(R.id.strengthBar);

        zxcvbn = new Zxcvbn();

        checkBtn.setOnClickListener(view -> {

            String password = passwordInput.getText().toString();

            if (password.isEmpty()) {
                strengthLabel.setText("Enter a password!");
                return;
            }

            Strength strength = zxcvbn.measure(password);
            int score = strength.getScore();

            // 🔥 Set Progress
            strengthBar.setProgress(score);

            // 🎨 Strength Label + Color
            if (score <= 1) {
                strengthLabel.setText("Weak 😟");
                strengthLabel.setTextColor(Color.RED);
            } else if (score == 2) {
                strengthLabel.setText("Medium 😐");
                strengthLabel.setTextColor(Color.parseColor("#FFA500")); // Orange
            } else {
                strengthLabel.setText("Strong 💪");
                strengthLabel.setTextColor(Color.GREEN);
            }

            // ⏱ Crack Time
            String time = strength.getCrackTimesDisplay()
                    .getOfflineSlowHashing1e4PerSecond();
            crackTime.setText("Time to crack: " + time);

            // 💡 Suggestions
            StringBuilder suggestText = new StringBuilder();

            if (strength.getFeedback().getSuggestions().isEmpty()) {
                suggestText.append("Good password 👍");
            } else {
                for (String s : strength.getFeedback().getSuggestions()) {
                    suggestText.append("• ").append(s).append("\n");
                }
            }

            // ⚠ Common Password Warning
            if (isCommon(password)) {
                suggestText.append("\n⚠ This is a commonly used password!");
            }

            suggestions.setText(suggestText.toString());
        });
    }
}
