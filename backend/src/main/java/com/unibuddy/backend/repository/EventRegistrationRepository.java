package com.unibuddy.backend.repository;

import com.unibuddy.backend.model.CampusEvent;
import com.unibuddy.backend.model.EventRegistration;
import com.unibuddy.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    List<EventRegistration> findByEvent(CampusEvent event);
    List<EventRegistration> findByUser(User user);
    Optional<EventRegistration> findByEventAndUser(CampusEvent event, User user);
    List<EventRegistration> findByEventAndReminderSentFalse(CampusEvent event);
    long countByEvent(CampusEvent event);
}
