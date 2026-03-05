package com.unibuddy.backend.controller;

import com.unibuddy.backend.model.ReminderPreference;
import com.unibuddy.backend.service.ReminderPreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reminders")
@CrossOrigin(origins = "*")
public class ReminderController {

    private final ReminderPreferenceService reminderPreferenceService;

    public ReminderController(ReminderPreferenceService reminderPreferenceService) {
        this.reminderPreferenceService = reminderPreferenceService;
    }

    @GetMapping("/preferences")
    public ResponseEntity<ReminderPreference> getPreferences(@RequestParam String universityId) {
        return ResponseEntity.ok(reminderPreferenceService.getPreferences(universityId));
    }

    @PutMapping("/preferences")
    public ResponseEntity<ReminderPreference> updatePreferences(
            @RequestParam String universityId,
            @RequestBody ReminderPreference preference) {
        return ResponseEntity.ok(reminderPreferenceService.updatePreferences(universityId, preference));
    }
}
