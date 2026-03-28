package com.unibuddy.backend.controller;

import com.unibuddy.backend.model.TutoringSession;
import com.unibuddy.backend.service.TutoringSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tutoring")
@CrossOrigin(origins = "*")
public class TutoringSessionController {

    @Autowired
    private TutoringSessionService service;

    @PostMapping("/book")
    public ResponseEntity<?> bookSession(@RequestBody TutoringSession session) {
        try {
            return ResponseEntity.ok(service.bookSession(session));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<TutoringSession>> getStudentHistory(@PathVariable String studentId) {
        return ResponseEntity.ok(service.getStudentHistory(studentId));
    }

    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<TutoringSession>> getTutorSchedule(@PathVariable String tutorId) {
        return ResponseEntity.ok(service.getTutorSchedule(tutorId));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<?> rescheduleSession(@PathVariable Long id, @RequestParam String studentId, @RequestBody TutoringSession updated) {
        try {
            return ResponseEntity.ok(service.updateSessionTime(id, updated, studentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<?> cancelSession(@PathVariable Long id, @RequestParam String studentId) {
        try {
            service.cancelSession(id, studentId);
            return ResponseEntity.ok(Map.of("message", "Cancelled"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    public static class DeclineRequest {
        public String declineReason;
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptSession(@PathVariable Long id, @RequestParam String tutorId) {
        try {
            service.acceptSession(id, tutorId);
            return ResponseEntity.ok(Map.of("message", "Accepted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/decline")
    public ResponseEntity<?> declineSession(@PathVariable Long id, @RequestParam String tutorId, @RequestBody DeclineRequest req) {
        try {
            service.declineSession(id, tutorId, req.declineReason);
            return ResponseEntity.ok(Map.of("message", "Declined"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeSession(@PathVariable Long id, @RequestParam String tutorId) {
        try {
            service.markCompleted(id, tutorId);
            return ResponseEntity.ok(Map.of("message", "Completed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/report/{studentId}")
    public ResponseEntity<byte[]> getCollaborationReport(@PathVariable String studentId) {
        byte[] pdfBytes = service.generateCollaborationSummary(studentId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "peer_summary_" + studentId + ".pdf");
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
