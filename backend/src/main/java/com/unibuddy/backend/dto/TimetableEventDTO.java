package com.unibuddy.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimetableEventDTO {
    private String id;
    private String batchType; // WD | WE
    private String mainGroup;
    private String subgroup;
    private String dayOfWeek; // MONDAY..SUNDAY
    private String startTime; // HH:mm
    private String endTime;   // HH:mm
    private String moduleCode;
    private String moduleName;
    private String activityType; // LECTURE | TUTORIAL | PRACTICAL | OTHER
    private String location;
    private String lecturer;
}
