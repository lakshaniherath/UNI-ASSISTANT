package com.unibuddy.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "personal_calendar_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalCalendarEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String universityId;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String notes;

    @Column(nullable = false)
    private String date; // yyyy-MM-dd

    @Column(nullable = false)
    private String startTime; // HH:mm

    @Column(nullable = false)
    private String endTime; // HH:mm

    private String colorTag;
}
