package com.example.passwordanalyzer;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

import com.nulabinc.zxcvbn.Zxcvbn;
import com.nulabinc.zxcvbn.Strength;

import java.util.Random;

public class MainActivity extends AppCompatActivity {

    EditText passwordInput;
    Button checkBtn, generateBtn;
    TextView resultText;
    ProgressBar strengthBar;
    CheckBox showPassword;

    Zxcvbn zxcvbn;

    String[] commonPasswords = {
            "123456", "password", "qwerty", "abc123", "admin"
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        passwordInput = findViewById(R.id.passwordInput);
        checkBtn = findViewById(R.id.checkBtn);
        generateBtn = findViewById(R.id.generateBtn);
        resultText = findViewById(R.id.resultText);
        strengthBar = findViewById(R.id.strengthBar);
        showPassword = findViewById(R.id.showPassword);

        zxcvbn = new Zxcvbn();

        // Show / Hide Password
        showPassword.setOnCheckedChangeListener((buttonView, isChecked) -> {
            if (isChecked) {
                passwordInput.setInputType(1);
            } else {
                passwordInput.setInputType(129);
            }
        });

        // Generate strong password
        generateBtn.setOnClickListener(v -> {
            String generated = generatePassword(12);
            passwordInput.setText(generated);
        });

        // Check strength
        checkBtn.setOnClickListener(v -> analyzePassword());
    }

    private void analyzePassword() {
        String password = passwordInput.getText().toString();

        if (password.isEmpty()) {
            resultText.setText("⚠ Enter a password!");
            return;
        }

        Strength strength = zxcvbn.measure(password);

        int score = strength.getScore();
        String crackTime = strength.getCrackTimesDisplay()
                .getOfflineSlowHashing1e4PerSecond();

        strengthBar.setProgress(score * 25);

        StringBuilder result = new StringBuilder();

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
            result.append("✔ Great password!\n");
        } else {
            for (String s : strength.getFeedback().getSuggestions()) {
                result.append("• ").append(s).append("\n");
            }
        }

        if (isCommon(password)) {
            result.append("\n⚠ Found in common passwords!");
        }

        resultText.setText(result.toString());
    }

    private boolean isCommon(String password) {
        for (String p : commonPasswords) {
            if (p.equals(password)) return true;
        }
        return false;
    }

    // Password Generator 🔑
    private String generatePassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
        Random random = new Random();
        StringBuilder password = new StringBuilder();

        for (int i = 0; i < length; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        return password.toString();
    }
}
