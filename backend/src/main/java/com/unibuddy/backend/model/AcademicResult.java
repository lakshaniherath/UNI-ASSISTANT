package com.unibuddy.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "academic_results")
@Data
public class AcademicResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentId;
    private int semester;
    private String moduleCode;
    private String moduleName;
    private int credits;
    private String grade;
    private double gradePoint;
}
