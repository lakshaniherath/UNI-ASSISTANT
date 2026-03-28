package com.unibuddy.backend.controller;

import com.unibuddy.backend.dto.FcmTokenRequestDTO;
import com.unibuddy.backend.model.User;
import com.unibuddy.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // 🚀 අලුතින් එකතු කළ Profile Update Endpoint එක
    @PutMapping("/{universityId}/profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable String universityId,
            @RequestBody User profileUpdates) {
        try {
            User updatedUser = userService.updateUserProfile(
                    universityId,
                    profileUpdates.getCgpa(),
                    profileUpdates.getMySkills()
            );
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating profile: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public List<User> getAll() {
        return userService.getAllUsers();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        User user = userService.loginUser(loginRequest.getEmail(), loginRequest.getPassword());

        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password!");
        }
    }

    @GetMapping("/student/{universityId}")
    public User getUserByUniId(@PathVariable String universityId) {
        return userService.getUserByUniversityId(universityId);
    }

    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam String query) {
        return userService.searchUsersByUniversityId(query);
    }

    @PutMapping("/{universityId}/fcm-token")
    public ResponseEntity<?> updateFcmToken(
            @PathVariable String universityId,
            @RequestBody FcmTokenRequestDTO tokenRequest) {
        try {
            User updatedUser = userService.updateFcmToken(universityId, tokenRequest.getFcmToken());
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating FCM token: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public String deleteUser(@PathVariable Long id) {
        return userService.deleteUser(id);
    }
}
