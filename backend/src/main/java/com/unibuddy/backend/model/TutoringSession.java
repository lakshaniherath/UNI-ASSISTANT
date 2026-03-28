package com.unibuddy.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "tutoring_sessions")
@Data
public class TutoringSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentId; 
    private String tutorId;   
    private String moduleCode; 

    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private String status = "PENDING"; 
    private String declineReason;
}
