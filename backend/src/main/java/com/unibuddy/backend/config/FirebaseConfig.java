package com.unibuddy.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account.path:}")
    private String serviceAccountPath;

    @Value("${firebase.storage.bucket}")
    private String storageBucket;

    @PostConstruct
    public void initialize() {
        if (serviceAccountPath == null || serviceAccountPath.isBlank()) {
            System.out.println("FCM disabled: firebase.service-account.path is not configured.");
            return;
        }

        try {
            // Using ClassPathResource to read from src/main/resources
            String resolvedPath = serviceAccountPath.replace("src/main/resources/", "");
            InputStream serviceAccount = new ClassPathResource(resolvedPath).getInputStream();
            
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setStorageBucket(storageBucket)
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase Admin initialized with bucket: " + storageBucket);
            }
        } catch (IOException e) {
            System.out.println("FCM initialization failed: " + e.getMessage());
        }
    }
}
