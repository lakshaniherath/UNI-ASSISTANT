package com.unibuddy.backend.service;

import com.unibuddy.backend.model.PersonalCalendarEvent;
import com.unibuddy.backend.repository.PersonalCalendarEventRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PersonalCalendarService {

    private final PersonalCalendarEventRepository personalCalendarEventRepository;

    public PersonalCalendarService(PersonalCalendarEventRepository personalCalendarEventRepository) {
        this.personalCalendarEventRepository = personalCalendarEventRepository;
    }

    public PersonalCalendarEvent create(String universityId, PersonalCalendarEvent event) {
        event.setId(null);
        event.setUniversityId(universityId);
        return personalCalendarEventRepository.save(event);
    }

    public List<PersonalCalendarEvent> getAll(String universityId) {
        return personalCalendarEventRepository.findByUniversityIdOrderByDateAscStartTimeAsc(universityId);
    }

    public PersonalCalendarEvent update(String universityId, Long id, PersonalCalendarEvent incoming) {
        PersonalCalendarEvent existing = personalCalendarEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Personal event not found: " + id));
        if (!existing.getUniversityId().trim().equalsIgnoreCase(universityId.trim())) {
            throw new RuntimeException("Unauthorized Access: You are only permitted to update your own events.");
        }

        existing.setTitle(incoming.getTitle());
        existing.setNotes(incoming.getNotes());
        existing.setDate(incoming.getDate());
        existing.setStartTime(incoming.getStartTime());
        existing.setEndTime(incoming.getEndTime());
        existing.setColorTag(incoming.getColorTag());
        return personalCalendarEventRepository.save(existing);
    }

    public void delete(String universityId, Long id) {
        PersonalCalendarEvent existing = personalCalendarEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Personal event not found: " + id));
        if (!existing.getUniversityId().trim().equalsIgnoreCase(universityId.trim())) {
            throw new RuntimeException("Unauthorized Access: You are only permitted to delete your own events.");
        }
        personalCalendarEventRepository.deleteById(id);
    }
}
