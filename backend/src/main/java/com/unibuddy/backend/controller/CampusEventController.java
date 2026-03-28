package com.unibuddy.backend.controller;

import com.unibuddy.backend.dto.CampusEventDTO;
import com.unibuddy.backend.service.CampusEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class CampusEventController {

    private final CampusEventService campusEventService;

    @GetMapping
    public ResponseEntity<List<CampusEventDTO>> getAllEvents() {
        return ResponseEntity.ok(campusEventService.getAllUpcomingEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampusEventDTO> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(campusEventService.getEventById(id));
    }

    @PostMapping
    public ResponseEntity<CampusEventDTO> createEvent(@RequestBody CampusEventDTO dto, @RequestParam String organizerId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(campusEventService.createEvent(dto, organizerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampusEventDTO> updateEvent(@PathVariable Long id, @RequestBody CampusEventDTO dto) {
        return ResponseEntity.ok(campusEventService.updateEvent(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        campusEventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/report/pdf")
    public ResponseEntity<byte[]> downloadEventCalendarPdf() {
        byte[] pdfBytes = campusEventService.generateMonthlyEventCalendarPdf();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", "monthly-event-calendar.pdf");
        headers.setCacheControl("no-store, no-cache, must-revalidate");
        headers.setPragma("no-cache");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
