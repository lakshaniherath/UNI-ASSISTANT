package com.unibuddy.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reminder_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReminderPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String universityId;

    // Timetable
    private boolean timetable24HoursEnabled = true;
    private boolean timetable2HoursEnabled = true;
    private boolean timetableStartEnabled = true;

    // Tasks
    private boolean task7DaysEnabled = true;
    private boolean task1DayEnabled = true;
    private boolean task2HoursEnabled = true;
    private boolean taskDeadlineEnabled = true;
}
