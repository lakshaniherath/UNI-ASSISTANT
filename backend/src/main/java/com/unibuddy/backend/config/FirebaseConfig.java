package com.unibuddy.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account.path:}")
    private String serviceAccountPath;

    @PostConstruct
    public void initialize() {
        if (serviceAccountPath == null || serviceAccountPath.isBlank()) {
            System.out.println("FCM disabled: firebase.service-account.path is not configured.");
            return;
        }

        try (FileInputStream serviceAccount = new FileInputStream(serviceAccountPath)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase Admin initialized successfully.");
            }
        } catch (IOException e) {
            System.out.println("FCM initialization failed: " + e.getMessage());
        }
    }
}
