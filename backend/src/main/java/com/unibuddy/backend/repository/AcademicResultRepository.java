package com.unibuddy.backend.repository;

import com.unibuddy.backend.model.AcademicResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AcademicResultRepository extends JpaRepository<AcademicResult, Long> {
    List<AcademicResult> findByStudentId(String studentId);
    List<AcademicResult> findByStudentIdAndSemester(String studentId, int semester);
}
