package com.unibuddy.backend.repository;

import com.unibuddy.backend.model.ReminderPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReminderPreferenceRepository extends JpaRepository<ReminderPreference, Long> {
    Optional<ReminderPreference> findByUniversityId(String universityId);
}
