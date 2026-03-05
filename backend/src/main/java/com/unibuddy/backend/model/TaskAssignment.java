package com.unibuddy.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "task_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String universityId;

    @Column(nullable = false)
    private String title;

    private String moduleCode;

    @Column(nullable = false)
    private String dueDateTime; // yyyy-MM-dd'T'HH:mm

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.PENDING;

    @Column(length = 2000)
    private String notes;
}
