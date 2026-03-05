package com.unibuddy.backend.controller;

import com.unibuddy.backend.model.PersonalCalendarEvent;
import com.unibuddy.backend.service.PersonalCalendarService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calendar/personal")
@CrossOrigin(origins = "*")
public class PersonalCalendarController {

    private final PersonalCalendarService personalCalendarService;

    public PersonalCalendarController(PersonalCalendarService personalCalendarService) {
        this.personalCalendarService = personalCalendarService;
    }

    @PostMapping
    public ResponseEntity<PersonalCalendarEvent> create(
            @RequestParam String universityId,
            @RequestBody PersonalCalendarEvent event) {
        return ResponseEntity.ok(personalCalendarService.create(universityId, event));
    }

    @GetMapping
    public ResponseEntity<List<PersonalCalendarEvent>> getAll(@RequestParam String universityId) {
        return ResponseEntity.ok(personalCalendarService.getAll(universityId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonalCalendarEvent> update(
            @RequestParam String universityId,
            @PathVariable Long id,
            @RequestBody PersonalCalendarEvent event) {
        return ResponseEntity.ok(personalCalendarService.update(universityId, id, event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@RequestParam String universityId, @PathVariable Long id) {
        personalCalendarService.delete(universityId, id);
        return ResponseEntity.noContent().build();
    }
}
