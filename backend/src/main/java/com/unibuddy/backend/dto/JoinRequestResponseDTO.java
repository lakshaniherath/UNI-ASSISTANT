package com.unibuddy.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JoinRequestResponseDTO {
    private Long id; // Request ID
    private String studentId;
    private String studentName;
    private String studentSkills; // Fetched live from User
    private String studentCgpa;   // Fetched live from User
}
