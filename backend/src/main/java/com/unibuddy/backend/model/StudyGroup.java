package com.unibuddy.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "study_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudyGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String groupName;
    private String description;
    private String subgroup;

    @ElementCollection
    private List<String> requiredSkills;

    private String targetCGPA;

    @ElementCollection
    private List<String> memberIds;

    private Integer maxMembers;
    private Integer currentMembers;
    private String creatorId;
}