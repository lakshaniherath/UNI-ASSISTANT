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
                    defaults.setClassRemindersEnabled(true);
                    defaults.setBeforeMinutesPrimary(10);
                    defaults.setBeforeMinutesSecondary(5);
                    defaults.setDeadline7DaysEnabled(true);
                    defaults.setDeadline1DayEnabled(true);
                    defaults.setDeadline1HourEnabled(true);
                    return reminderPreferenceRepository.save(defaults);
                });
    }

    public ReminderPreference updatePreferences(String universityId, ReminderPreference incoming) {
        ReminderPreference current = getPreferences(universityId);
        current.setClassRemindersEnabled(incoming.isClassRemindersEnabled());
        current.setBeforeMinutesPrimary(incoming.getBeforeMinutesPrimary());
        current.setBeforeMinutesSecondary(incoming.getBeforeMinutesSecondary());
        current.setDeadline7DaysEnabled(incoming.isDeadline7DaysEnabled());
        current.setDeadline1DayEnabled(incoming.isDeadline1DayEnabled());
        current.setDeadline1HourEnabled(incoming.isDeadline1HourEnabled());
        return reminderPreferenceRepository.save(current);
    }
}
