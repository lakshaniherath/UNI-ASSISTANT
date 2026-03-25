package com.unibuddy.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recovery_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecoveryPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String universityId;

    // Original missed class info
    private String originalModuleCode;
    private String originalActivityType;
    private String originalTime;

    // Chosen recovery slot info
    private String recoveryModuleCode;
    private String recoveryActivityType;
    private String recoveryDay;
    private String recoveryStartTime;
    private String recoveryEndTime;
    private String recoveryLocation;
    private String recoverySubgroup;
}
