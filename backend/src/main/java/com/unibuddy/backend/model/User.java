package com.unibuddy.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String universityId;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String subgroup;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // The student's actual CGPA range
    private String cgpa;

    // The student's selected skills
    @ElementCollection
    private List<String> mySkills;

    @Column(length = 1024)
    private String fcmToken;
}
