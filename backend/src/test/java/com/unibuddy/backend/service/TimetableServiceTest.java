package com.unibuddy.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unibuddy.backend.dto.TimetableEventDTO;
import com.unibuddy.backend.dto.TimetableRecoveryRequestDTO;
import com.unibuddy.backend.dto.TimetableRecoveryResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TimetableServiceTest {

    private TimetableService timetableService;

    @BeforeEach
    void setUp() {
        timetableService = new TimetableService(new ObjectMapper());
        timetableService.loadTimetables();
    }

    @Test
    void wdMissedLectureShouldSuggestWeekendAlternatives() {
        List<TimetableEventDTO> wdEvents = timetableService.getTimetableForSubgroup("Y3.S1.WD.IT.0201");
        TimetableEventDTO missed = wdEvents.stream()
                .filter(e -> "IT3010".equals(e.getModuleCode()))
                .findFirst()
                .orElseThrow();

        TimetableRecoveryRequestDTO request = new TimetableRecoveryRequestDTO();
        request.setStudentSubgroup("Y3.S1.WD.IT.0201");
        request.setMissedEventId(missed.getId());
        request.setMode("MISSED");

        TimetableRecoveryResponseDTO response = timetableService.getRecoverySuggestions(request);
        assertFalse(response.getAlternatives().isEmpty());
        assertTrue(response.getAlternatives().stream().allMatch(e -> "WE".equals(e.getBatchType())));
    }

    @Test
    void weMissedLectureShouldSuggestWeekdayAlternatives() {
        List<TimetableEventDTO> weEvents = timetableService.getTimetableForSubgroup("Y3.S1.WE.IT.0101");
        TimetableEventDTO missed = weEvents.stream()
                .filter(e -> "IT3040".equals(e.getModuleCode()))
                .findFirst()
                .orElseThrow();

        TimetableRecoveryRequestDTO request = new TimetableRecoveryRequestDTO();
        request.setStudentSubgroup("Y3.S1.WE.IT.0101");
        request.setMissedEventId(missed.getId());
        request.setMode("MISSED");

        TimetableRecoveryResponseDTO response = timetableService.getRecoverySuggestions(request);
        assertFalse(response.getAlternatives().isEmpty());
        assertTrue(response.getAlternatives().stream().allMatch(e -> "WD".equals(e.getBatchType())));
    }

    @Test
    void shouldReturnNoAlternativesWhenMissedEventHasNoModuleCode() {
        List<TimetableEventDTO> wdEvents = timetableService.getTimetableForSubgroup("Y3.S1.WD.IT.0201");
        TimetableEventDTO missed = wdEvents.stream()
                .filter(e -> e.getModuleCode() == null || e.getModuleCode().isBlank())
                .findFirst()
                .orElseThrow();

        TimetableRecoveryRequestDTO request = new TimetableRecoveryRequestDTO();
        request.setStudentSubgroup("Y3.S1.WD.IT.0201");
        request.setMissedEventId(missed.getId());
        request.setMode("MISSED");

        TimetableRecoveryResponseDTO response = timetableService.getRecoverySuggestions(request);
        assertNotNull(response);
        assertTrue(response.getAlternatives().isEmpty());
    }
}
