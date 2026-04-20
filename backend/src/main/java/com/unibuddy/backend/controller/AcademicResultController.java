package com.unibuddy.backend.controller;

import com.unibuddy.backend.model.AcademicResult;
import com.unibuddy.backend.service.AcademicResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/academic")
@CrossOrigin(origins = "*")
public class AcademicResultController {

    @Autowired
    private AcademicResultService academicService;

    @PostMapping
    public ResponseEntity<AcademicResult> addResult(@RequestBody AcademicResult result) {
        return ResponseEntity.ok(academicService.saveResult(result));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AcademicResult>> getResults(@PathVariable String studentId) {
        return ResponseEntity.ok(academicService.getResultsByStudent(studentId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcademicResult> updateResult(@PathVariable Long id, @RequestBody AcademicResult result) {
        return ResponseEntity.ok(academicService.updateResult(id, result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResult(@PathVariable Long id) {
        academicService.deleteResult(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/cgpa/{studentId}")
    public ResponseEntity<Double> getCGPA(@PathVariable String studentId) {
        return ResponseEntity.ok(academicService.calculateCGPA(studentId));
    }

    @GetMapping("/gpa/{studentId}/semester/{semester}")
    public ResponseEntity<Double> getSemesterGPA(@PathVariable String studentId, @PathVariable int semester) {
        return ResponseEntity.ok(academicService.calculateSemesterGPA(studentId, semester));
    }

    @GetMapping("/predict/{studentId}")
    public ResponseEntity<Map<String, Object>> predictGPA(
            @PathVariable String studentId,
            @RequestParam double targetCGPA,
            @RequestParam int remainingCredits) {
        return ResponseEntity.ok(academicService.predictRequiredGPA(studentId, targetCGPA, remainingCredits));
    }

    @GetMapping("/report/{studentId}")
    public ResponseEntity<byte[]> getAcademicReport(@PathVariable String studentId) {
        byte[] pdfBytes = academicService.generateAcademicReport(studentId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "academic_report_" + studentId + ".pdf");
        
        headers.setCacheControl("no-cache, no-store, must-revalidate");
        headers.setPragma("no-cache");
        headers.setExpires(0);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
