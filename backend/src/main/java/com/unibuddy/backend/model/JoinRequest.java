package com.unibuddy.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "join_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JoinRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long groupId;
    private String studentId;
    private String status; // PENDING, ACCEPTED, REJECTED
}