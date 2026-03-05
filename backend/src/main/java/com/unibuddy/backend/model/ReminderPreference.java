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

    private boolean classRemindersEnabled = true;
    private Integer beforeMinutesPrimary = 10;
    private Integer beforeMinutesSecondary = 5;

    private boolean deadline7DaysEnabled = true;
    private boolean deadline1DayEnabled = true;
    private boolean deadline1HourEnabled = true;
}
