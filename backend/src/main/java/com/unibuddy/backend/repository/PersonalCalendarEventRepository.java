package com.unibuddy.backend.repository;

import com.unibuddy.backend.model.PersonalCalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PersonalCalendarEventRepository extends JpaRepository<PersonalCalendarEvent, Long> {
    List<PersonalCalendarEvent> findByUniversityIdOrderByDateAscStartTimeAsc(String universityId);
}
