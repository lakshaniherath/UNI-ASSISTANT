package com.unibuddy.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecoveryPlanDTO {
    private Long id;
    private String universityId;
    
    // Original
    private String originalModuleCode;
    private String originalActivityType;
    private String originalTime;

    // Recovery
    private String recoveryModuleCode;
    private String recoveryActivityType;
    private String recoveryDay;
    private String recoveryStartTime;
    private String recoveryEndTime;
    private String recoveryLocation;
    private String recoverySubgroup;
}
