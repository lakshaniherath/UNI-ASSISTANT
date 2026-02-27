package com.unibuddy.backend.controller;

import com.unibuddy.backend.model.User;
import com.unibuddy.backend.service.UserService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Mobile app ekata access denna
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @GetMapping("/all")
    public List<User> getAll() {
        return userService.getAllUsers();
    }

    @PostMapping("/login")
    public String login(@RequestBody User loginRequest) {
        User user = userService.loginUser(loginRequest.getEmail(), loginRequest.getPassword());

        if (user != null) {
            return "Login Successful! Welcome " + user.getName() + " (" + user.getRole() + ")";
        } else {
            return "Invalid email or password!";
        }
    }
    // GET Request: Admin ta ID eken user wa balanna
    @GetMapping("/student/{universityId}")
    public User getUserByUniId(@PathVariable String universityId) {
        return userService.getUserByUniversityId(universityId);
    }

    // DELETE Request: Admin ta user wa remove karanna
    @DeleteMapping("/delete/{id}")
    public String deleteUser(@PathVariable Long id) {
        return userService.deleteUser(id);
    }
}