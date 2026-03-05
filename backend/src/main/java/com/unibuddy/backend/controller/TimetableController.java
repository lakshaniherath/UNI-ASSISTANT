package com.unibuddy.backend.controller;

import com.unibuddy.backend.dto.TimetableEventDTO;
import com.unibuddy.backend.dto.TimetableRecoveryRequestDTO;
import com.unibuddy.backend.dto.TimetableRecoveryResponseDTO;
import com.unibuddy.backend.service.TimetableService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
@CrossOrigin(origins = "*")
public class TimetableController {

    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    @GetMapping("/{subgroup}")
    public ResponseEntity<List<TimetableEventDTO>> getTimetable(@PathVariable String subgroup) {
        return ResponseEntity.ok(timetableService.getTimetableForSubgroup(subgroup));
    }

    @PostMapping("/recovery")
    public ResponseEntity<TimetableRecoveryResponseDTO> getRecoverySuggestions(
            @RequestBody TimetableRecoveryRequestDTO request) {
        return ResponseEntity.ok(timetableService.getRecoverySuggestions(request));
    }
}
