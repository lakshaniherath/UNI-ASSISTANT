package com.unibuddy.backend.dto;

import com.unibuddy.backend.model.StudyGroup;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StudyGroupResponseDTO {
    private StudyGroup group;
    private int matchScore;
}