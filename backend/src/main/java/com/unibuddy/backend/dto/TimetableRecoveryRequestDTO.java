package com.unibuddy.backend.dto;

import lombok.Data;

@Data
public class TimetableRecoveryRequestDTO {
    private String studentSubgroup;
    private String missedEventId;
    private String mode; // MISSED / WILL_MISS
}
