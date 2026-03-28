package com.unibuddy.backend.service;

import com.unibuddy.backend.model.CampusEvent;
import com.unibuddy.backend.model.EventRegistration;
import com.unibuddy.backend.model.User;
import com.unibuddy.backend.repository.CampusEventRepository;
import com.unibuddy.backend.repository.EventRegistrationRepository;
import com.unibuddy.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EventRegistrationService {

    private final EventRegistrationRepository registrationRepository;
    private final CampusEventRepository eventRepository;
    private final UserRepository userRepository;

    public EventRegistrationService(EventRegistrationRepository registrationRepository,
                                    CampusEventRepository eventRepository,
                                    UserRepository userRepository) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public void markAsGoing(Long eventId, String universityId) {
        CampusEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        User user = userRepository.findByUniversityId(universityId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<EventRegistration> existing = registrationRepository.findByEventAndUser(event, user);
        if (existing.isEmpty()) {
            EventRegistration registration = new EventRegistration();
            registration.setEvent(event);
            registration.setUser(user);
            registration.setReminderSent(false);
            registrationRepository.save(registration);
        }
    }

    public void unmarkAsGoing(Long eventId, String universityId) {
        CampusEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        User user = userRepository.findByUniversityId(universityId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        registrationRepository.findByEventAndUser(event, user)
                .ifPresent(registrationRepository::delete);
    }
    
    public boolean isGoing(Long eventId, String universityId) {
        CampusEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        User user = userRepository.findByUniversityId(universityId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return registrationRepository.findByEventAndUser(event, user).isPresent();
    }
}
