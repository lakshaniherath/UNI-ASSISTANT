package com.unibuddy.backend.service;

import com.unibuddy.backend.model.User;
import com.unibuddy.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    // Meka thama constructor injection. Meka use karanna kiyala thama IntelliJ kiyanne.
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registerUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}