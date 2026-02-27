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

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // user Login logic
    public User loginUser(String email, String password) {
        // 1. Email eken user wa database eken hoyaganna
        return userRepository.findByEmail(email)
                // 2. User dunnu password ekai, database eke thiyena hashed password ekai match wenawada balanna
                .filter(user -> passwordEncoder.matches(password, user.getPassword()))
                // 3. Match wenne nathnam (hari email eka nathnam) null yawanna
                .orElse(null);

    }
    // 1. University ID eken user wa hoyanna (Admin feature)
    public User getUserByUniversityId(String universityId) {
        return userRepository.findByUniversityId(universityId)
                .orElse(null); // User nathnam null yawamu
    }

    // 2. User wa DB eken delete karanna (Admin feature)
    public String deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return "User account deleted successfully!";
        } else {
            return "User not found!";
        }
    }
}