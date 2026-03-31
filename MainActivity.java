package com.example.passwordanalyzer;

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

        zxcvbn = new Zxcvbn();

        checkBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String password = passwordInput.getText().toString();

                if (password.isEmpty()) {
                    resultText.setText("Enter a password!");
                    return;
                }

                Strength strength = zxcvbn.measure(password);

                int score = strength.getScore();
                String crackTime = strength.getCrackTimesDisplay().getOfflineSlowHashing1e4PerSecond();

                String result = "";

                if (score <= 1) {
                    result += "Weak Password 😟\n";
                } else if (score == 2) {
                    result += "Medium Password 😐\n";
                } else {
                    result += "Strong Password 💪\n";
                }

                result += "Time to crack: " + crackTime + "\n\n";

                result += "Suggestions:\n";
                for (String s : strength.getFeedback().getSuggestions()) {
                    result += "- " + s + "\n";
                }

                if (isCommon(password)) {
                    result += "\n⚠ Found in common passwords!";
                }

                resultText.setText(result);
            }
        });
    }
}
