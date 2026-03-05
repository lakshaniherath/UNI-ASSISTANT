package com.unibuddy.backend.service;

import com.unibuddy.backend.model.User;
import com.unibuddy.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        return userRepository.save(user);
    }

    // 🚀 අලුතින් එකතු කළ Profile Update Method එක
    public User updateUserProfile(String universityId, String cgpa, List<String> mySkills) {
        User user = userRepository.findByUniversityId(universityId)
                .orElseThrow(() -> new RuntimeException("User not found with university ID: " + universityId));

        user.setCgpa(cgpa);
        user.setMySkills(mySkills);

        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User loginUser(String email, String password) {
        System.out.println("DEBUG: Login attempt for email: [" + email + "]");
        return userRepository.findByEmail(email)
                .map(user -> {
                    boolean isMatch = passwordEncoder.matches(password, user.getPassword());
                    System.out.println("DEBUG: User found! Password match result: " + isMatch);
                    return isMatch ? user : null;
                })
                .orElseGet(() -> {
                    System.out.println("DEBUG: No user found with email: [" + email + "]");
                    return null;
                });
    }

    public User getUserByUniversityId(String universityId) {
        return userRepository.findByUniversityId(universityId).orElse(null);
    }

    public User updateFcmToken(String universityId, String fcmToken) {
        User user = userRepository.findByUniversityId(universityId)
                .orElseThrow(() -> new RuntimeException("User not found with university ID: " + universityId));

        user.setFcmToken(fcmToken);
        return userRepository.save(user);
    }

    public String deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return "User account deleted successfully!";
        } else {
            return "User not found!";
        }
    }
}
