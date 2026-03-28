package com.unibuddy.backend.service;

import com.unibuddy.backend.model.CampusEvent;
import com.unibuddy.backend.model.EventRegistration;
import com.unibuddy.backend.repository.CampusEventRepository;
import com.unibuddy.backend.repository.EventRegistrationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EventReminderService {

    private final CampusEventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final FcmNotificationService notificationService;

    public EventReminderService(CampusEventRepository eventRepository,
                                EventRegistrationRepository registrationRepository,
                                FcmNotificationService notificationService) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.notificationService = notificationService;
    }

    // Runs every hour
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void sendReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        
        // Find events happening tomorrow
        List<CampusEvent> upcomingEvents = eventRepository.findByEventDateGreaterThanEqualOrderByEventDateAscStartTimeAsc(tomorrow)
            .stream()
            .filter(e -> e.getEventDate().equals(tomorrow))
            .toList();

        for (CampusEvent event : upcomingEvents) {
            List<EventRegistration> registrations = registrationRepository.findByEventAndReminderSentFalse(event);
            for (EventRegistration reg : registrations) {
                Map<String, String> data = new HashMap<>();
                data.put("eventId", String.valueOf(event.getId()));
                data.put("type", "EVENT_REMINDER");
                
                String title = "Upcoming Event: " + event.getTitle();
                String body = "Don't forget! Your event starts tomorrow at " + event.getStartTime() + " in " + event.getLocation() + ".";
                
                notificationService.sendToUser(reg.getUser().getUniversityId(), title, body, data);
                
                reg.setReminderSent(true);
                registrationRepository.save(reg);
            }
        }
    }
}
