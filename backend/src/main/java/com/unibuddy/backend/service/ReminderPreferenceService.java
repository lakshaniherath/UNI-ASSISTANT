package com.unibuddy.backend.service;

import com.unibuddy.backend.model.ReminderPreference;
import com.unibuddy.backend.repository.ReminderPreferenceRepository;
import org.springframework.stereotype.Service;

@Service
public class ReminderPreferenceService {

    private final ReminderPreferenceRepository reminderPreferenceRepository;

    public ReminderPreferenceService(ReminderPreferenceRepository reminderPreferenceRepository) {
        this.reminderPreferenceRepository = reminderPreferenceRepository;
    }

    public ReminderPreference getPreferences(String universityId) {
        return reminderPreferenceRepository.findByUniversityId(universityId)
                .orElseGet(() -> {
                    ReminderPreference defaults = new ReminderPreference();
                    defaults.setUniversityId(universityId);
                    defaults.setTimetable24HoursEnabled(true);
                    defaults.setTimetable2HoursEnabled(true);
                    defaults.setTimetableStartEnabled(true);
                    defaults.setTask7DaysEnabled(true);
                    defaults.setTask1DayEnabled(true);
                    defaults.setTask2HoursEnabled(true);
                    defaults.setTaskDeadlineEnabled(true);
                    return reminderPreferenceRepository.save(defaults);
                });
    }

    public ReminderPreference updatePreferences(String universityId, ReminderPreference incoming) {
        ReminderPreference current = getPreferences(universityId);
        current.setTimetable24HoursEnabled(incoming.isTimetable24HoursEnabled());
        current.setTimetable2HoursEnabled(incoming.isTimetable2HoursEnabled());
        current.setTimetableStartEnabled(incoming.isTimetableStartEnabled());
        current.setTask7DaysEnabled(incoming.isTask7DaysEnabled());
        current.setTask1DayEnabled(incoming.isTask1DayEnabled());
        current.setTask2HoursEnabled(incoming.isTask2HoursEnabled());
        current.setTaskDeadlineEnabled(incoming.isTaskDeadlineEnabled());
        return reminderPreferenceRepository.save(current);
    }
}
