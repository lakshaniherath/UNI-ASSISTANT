package com.unibuddy.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CampusEventDTO {
    private Long id;
    private String title;
    private String description;
    private String location;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String type;
    private String organizerName;
    private String organizerUniversityId;
    private long attendeesCount;
}
