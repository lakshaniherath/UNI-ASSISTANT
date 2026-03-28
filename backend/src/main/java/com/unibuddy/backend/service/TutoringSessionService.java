package com.unibuddy.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.unibuddy.backend.model.TutoringSession;
import com.unibuddy.backend.repository.TutoringSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class TutoringSessionService {

    @Autowired
    private TutoringSessionRepository repository;

    public TutoringSession bookSession(TutoringSession session) {
        if (repository.isTutorBooked(session.getTutorId(), session.getSessionDate(), session.getStartTime(), session.getEndTime())) {
            throw new RuntimeException("Scheduling Error: The selected tutor is unavailable at the requested time.");
        }
        return repository.save(session);
    }

    public List<TutoringSession> getStudentHistory(String studentId) {
        return repository.findByStudentIdOrderBySessionDateDesc(studentId);
    }

    public List<TutoringSession> getTutorSchedule(String tutorId) {
        return repository.findByTutorIdOrderBySessionDateDesc(tutorId);
    }

    public TutoringSession updateSessionTime(Long id, TutoringSession updated, String requestingStudentId) {
        return repository.findById(id).map(session -> {
            if (session.getStudentId() == null || requestingStudentId == null || !session.getStudentId().trim().equalsIgnoreCase(requestingStudentId.trim())) {
                throw new RuntimeException("Unauthorized Access: Only the student who originated this booking can modify it.");
            }
            
            session.setSessionDate(updated.getSessionDate());
            session.setStartTime(updated.getStartTime());
            session.setEndTime(updated.getEndTime());
            session.setStatus("PENDING"); // reset to pending on change
            
            return repository.save(session);
        }).orElseThrow(() -> new RuntimeException("Session not found"));
    }

    public void acceptSession(Long id, String tutorId) {
        TutoringSession session = repository.findById(id).orElseThrow(() -> new RuntimeException("Session not found"));
        if (session.getTutorId() == null || tutorId == null || !session.getTutorId().trim().equalsIgnoreCase(tutorId.trim())) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (repository.isTutorBooked(tutorId, session.getSessionDate(), session.getStartTime(), session.getEndTime())) {
            throw new RuntimeException("Scheduling Conflict: You already have an accepted booking that overlaps with this time slot.");
        }
        
        session.setStatus("SCHEDULED");
        repository.save(session);
    }

    public void declineSession(Long id, String tutorId, String reason) {
        TutoringSession session = repository.findById(id).orElseThrow(() -> new RuntimeException("Session not found"));
        if (session.getTutorId() == null || tutorId == null || !session.getTutorId().trim().equalsIgnoreCase(tutorId.trim())) {
            throw new RuntimeException("Unauthorized");
        }
        session.setStatus("DECLINED");
        session.setDeclineReason(reason);
        repository.save(session);
    }

    public void cancelSession(Long id, String requestingStudentId) {
        TutoringSession session = repository.findById(id).orElseThrow(() -> new RuntimeException("Session not found"));
        boolean isStudent = session.getStudentId() != null && requestingStudentId != null && session.getStudentId().trim().equalsIgnoreCase(requestingStudentId.trim());
        boolean isTutor = session.getTutorId() != null && requestingStudentId != null && session.getTutorId().trim().equalsIgnoreCase(requestingStudentId.trim());
        if (!isStudent && !isTutor) {
            throw new RuntimeException("Unauthorized Access: You lack the necessary permissions to cancel this session.");
        }
        session.setStatus("CANCELLED");
        repository.save(session);
    }
    
    public void markCompleted(Long id, String tutorId) {
        TutoringSession session = repository.findById(id).orElseThrow(() -> new RuntimeException("Session not found"));
        if (session.getTutorId() == null || tutorId == null || !session.getTutorId().trim().equalsIgnoreCase(tutorId.trim())) {
            throw new RuntimeException("Unauthorized");
        }
        session.setStatus("COMPLETED");
        repository.save(session);
    }

    public byte[] generateCollaborationSummary(String studentId) {
        List<TutoringSession> sessions = repository.findByStudentIdOrderBySessionDateDesc(studentId);
        
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Paragraph title = new Paragraph("Peer Collaboration Summary", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);
            
            Paragraph studentInfo = new Paragraph("Student ID: " + studentId);
            studentInfo.setSpacingAfter(20);
            document.add(studentInfo);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            
            String[] headers = {"Date", "Module", "Tutor", "Status"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
                table.addCell(cell);
            }
            
            for (TutoringSession s : sessions) {
                table.addCell(s.getSessionDate().toString());
                table.addCell(s.getModuleCode());
                table.addCell(s.getTutorId());
                table.addCell(s.getStatus());
            }

            document.add(table);
            document.close();
            return baos.toByteArray();
        } catch (DocumentException | IOException e) {
            throw new RuntimeException("Failed to generate report", e);
        }
    }
}
