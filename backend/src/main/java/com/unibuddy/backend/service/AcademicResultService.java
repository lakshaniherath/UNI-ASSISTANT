package com.unibuddy.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.unibuddy.backend.model.AcademicResult;
import com.unibuddy.backend.repository.AcademicResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AcademicResultService {

    @Autowired
    private AcademicResultRepository repository;

    public AcademicResult saveResult(AcademicResult result) {
        return repository.save(result);
    }

    public List<AcademicResult> getResultsByStudent(String studentId) {
        return repository.findByStudentId(studentId);
    }
    
    public List<AcademicResult> getResultsByStudentAndSemester(String studentId, int semester) {
        return repository.findByStudentIdAndSemester(studentId, semester);
    }

    public void deleteResult(Long id) {
        repository.deleteById(id);
    }

    public AcademicResult updateResult(Long id, AcademicResult updated) {
        return repository.findById(id).map(result -> {
            result.setSemester(updated.getSemester());
            result.setModuleCode(updated.getModuleCode());
            result.setModuleName(updated.getModuleName());
            result.setCredits(updated.getCredits());
            result.setGrade(updated.getGrade());
            result.setGradePoint(updated.getGradePoint());
            return repository.save(result);
        }).orElseThrow(() -> new RuntimeException("Result not found"));
    }

    public double calculateCGPA(String studentId) {
        List<AcademicResult> results = repository.findByStudentId(studentId);
        return computeGPA(results);
    }

    public double calculateSemesterGPA(String studentId, int semester) {
        List<AcademicResult> results = repository.findByStudentIdAndSemester(studentId, semester);
        return computeGPA(results);
    }

    private double computeGPA(List<AcademicResult> results) {
        if (results == null || results.isEmpty()) return 0.0;
        
        double totalPoints = 0;
        int totalCredits = 0;

        for (AcademicResult r : results) {
            totalPoints += (r.getGradePoint() * r.getCredits());
            totalCredits += r.getCredits();
        }
        
        return totalCredits == 0 ? 0.0 : Math.round((totalPoints / totalCredits) * 100.0) / 100.0;
    }

    public Map<String, Object> predictRequiredGPA(String studentId, double targetCGPA, int remainingCredits) {
        List<AcademicResult> results = repository.findByStudentId(studentId);
        
        double currentTotalPoints = 0;
        int currentTotalCredits = 0;

        for (AcademicResult r : results) {
            currentTotalPoints += (r.getGradePoint() * r.getCredits());
            currentTotalCredits += r.getCredits();
        }
        
        int projectedTotalCredits = currentTotalCredits + remainingCredits;
        double requiredTotalPoints = (targetCGPA * projectedTotalCredits) - currentTotalPoints;
        double requiredGPAForRemaining = remainingCredits == 0 ? 0 : requiredTotalPoints / remainingCredits;
        
        Map<String, Object> prediction = new HashMap<>();
        prediction.put("currentCGPA", computeGPA(results));
        prediction.put("currentCredits", currentTotalCredits);
        prediction.put("remainingCredits", remainingCredits);
        prediction.put("targetCGPA", targetCGPA);
        prediction.put("requiredGPA", Math.round(requiredGPAForRemaining * 100.0) / 100.0);
        
        boolean isPossible = requiredGPAForRemaining <= 4.0 && requiredGPAForRemaining > 0;
        prediction.put("isPossible", isPossible || (remainingCredits == 0 && computeGPA(results) >= targetCGPA));

        return prediction;
    }

    public byte[] generateAcademicReport(String studentId) {
        List<AcademicResult> results = repository.findByStudentId(studentId);
        
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Paragraph title = new Paragraph("Academic Growth Report", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);
            
            Paragraph studentInfo = new Paragraph("Student ID: " + studentId + "\nOverall CGPA: " + calculateCGPA(studentId));
            studentInfo.setSpacingAfter(20);
            document.add(studentInfo);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            
            String[] headers = {"Semester", "Module", "Credits", "Grade (Point)"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
                table.addCell(cell);
            }
            
            for (AcademicResult r : results) {
                table.addCell(String.valueOf(r.getSemester()));
                table.addCell(r.getModuleCode() + " - " + (r.getModuleName() != null ? r.getModuleName() : ""));
                table.addCell(String.valueOf(r.getCredits()));
                table.addCell(r.getGrade() + " (" + r.getGradePoint() + ")");
            }

            document.add(table);
            document.close();
            return baos.toByteArray();
        } catch (DocumentException | IOException e) {
            throw new RuntimeException("Failed to generate report", e);
        }
    }
}
