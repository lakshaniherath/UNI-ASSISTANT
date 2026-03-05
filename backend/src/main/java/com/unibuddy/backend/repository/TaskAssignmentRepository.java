package com.unibuddy.backend.repository;

import com.unibuddy.backend.model.TaskAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, Long> {
    List<TaskAssignment> findByUniversityIdOrderByDueDateTimeAsc(String universityId);
}
