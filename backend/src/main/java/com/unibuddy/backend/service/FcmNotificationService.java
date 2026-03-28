package com.unibuddy.backend.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

import com.unibuddy.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class FcmNotificationService {

    private final UserRepository userRepository;

    public FcmNotificationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void sendToUser(String universityId, String title, String body, Map<String, String> data) {
        userRepository.findByUniversityId(universityId).ifPresent(user -> {
            String token = user.getFcmToken();
            if (token == null || token.isBlank()) {
                return;
            }

            try {
                Message.Builder messageBuilder = Message.builder()
                        .setToken(token)
                        .setNotification(Notification.builder()
                                .setTitle(title)
                                .setBody(body)
                                .build());

                if (data != null && !data.isEmpty()) {
                    messageBuilder.putAllData(data);
                }

                FirebaseMessaging.getInstance().send(messageBuilder.build());
            } catch (Exception e) {
                System.out.println("Failed to send FCM to user " + universityId + ": " + e.getMessage());
            }
        });
    }
}
