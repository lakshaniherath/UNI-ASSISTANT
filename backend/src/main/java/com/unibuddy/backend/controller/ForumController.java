package com.unibuddy.backend.controller;

import com.unibuddy.backend.model.ForumAnswer;
import com.unibuddy.backend.model.ForumQuestion;
import com.unibuddy.backend.service.ForumService;
import com.unibuddy.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;
    private final ReportService reportService;

    // --- Questions ---

    @PostMapping("/questions")
    public ResponseEntity<ForumQuestion> createQuestion(@RequestBody ForumQuestion question) {
        return ResponseEntity.status(HttpStatus.CREATED).body(forumService.createQuestion(question));
    }

    @GetMapping("/questions/module/{moduleCode}")
    public ResponseEntity<List<ForumQuestion>> getQuestionsByModule(@PathVariable String moduleCode) {
        return ResponseEntity.ok(forumService.getQuestionsByModule(moduleCode));
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<ForumQuestion> updateQuestion(@PathVariable Long id, @RequestBody ForumQuestion question, @RequestParam String userId) {
        return ResponseEntity.ok(forumService.updateQuestion(id, question, userId));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id, @RequestParam String userId) {
        forumService.deleteQuestion(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/questions/{id}/vote")
    public ResponseEntity<ForumQuestion> voteQuestion(@PathVariable Long id, @RequestParam boolean upvote, @RequestParam String userId) {
        return ResponseEntity.ok(forumService.voteQuestion(id, upvote, userId));
    }

    @GetMapping("/questions/duplicates")
    public ResponseEntity<List<ForumQuestion>> getPotentialDuplicates(@RequestParam String title, @RequestParam String moduleCode) {
        return ResponseEntity.ok(forumService.findPotentialDuplicates(title, moduleCode));
    }

    // --- Report ---

    @GetMapping("/questions/{id}/report")
    public ResponseEntity<byte[]> downloadReport(@PathVariable Long id) {
        byte[] pdfBytes = reportService.generateRecommendedQAPDF(id);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", "academic-forum-report-" + id + ".pdf");
        headers.setCacheControl("no-store, no-cache, must-revalidate");
        headers.setPragma("no-cache");
        
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    // --- Answers ---

    @PostMapping("/answers")
    public ResponseEntity<ForumAnswer> createAnswer(@RequestBody ForumAnswer answer) {
        return ResponseEntity.status(HttpStatus.CREATED).body(forumService.createAnswer(answer));
    }

    @GetMapping("/questions/{id}/answers")
    public ResponseEntity<List<ForumAnswer>> getAnswersForQuestion(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.getAnswersForQuestion(id));
    }

    @PutMapping("/answers/{id}")
    public ResponseEntity<ForumAnswer> updateAnswer(@PathVariable Long id, @RequestBody ForumAnswer answer, @RequestParam String userId) {
        return ResponseEntity.ok(forumService.updateAnswer(id, answer, userId));
    }

    @DeleteMapping("/answers/{id}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Long id, @RequestParam String userId) {
        forumService.deleteAnswer(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/answers/{id}/vote")
    public ResponseEntity<ForumAnswer> voteAnswer(@PathVariable Long id, @RequestParam boolean upvote, @RequestParam String userId) {
        return ResponseEntity.ok(forumService.voteAnswer(id, upvote, userId));
    }
}
