package com.unibuddy.backend.controller;

import com.unibuddy.backend.service.EventRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events/{eventId}/registrations")
@RequiredArgsConstructor
public class EventRegistrationController {

    private final EventRegistrationService registrationService;

    @PostMapping
    public ResponseEntity<Void> markAsGoing(@PathVariable Long eventId, @RequestParam String userId) {
        registrationService.markAsGoing(eventId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> unmarkAsGoing(@PathVariable Long eventId, @RequestParam String userId) {
        registrationService.unmarkAsGoing(eventId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status")
    public ResponseEntity<Boolean> getRegistrationStatus(@PathVariable Long eventId, @RequestParam String userId) {
        return ResponseEntity.ok(registrationService.isGoing(eventId, userId));
    }
}
