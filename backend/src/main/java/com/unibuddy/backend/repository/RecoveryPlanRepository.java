package com.unibuddy.backend.repository;

import com.unibuddy.backend.model.RecoveryPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecoveryPlanRepository extends JpaRepository<RecoveryPlan, Long> {
    List<RecoveryPlan> findByUniversityId(String universityId);
}
