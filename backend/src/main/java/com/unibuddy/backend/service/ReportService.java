package com.unibuddy.backend.service;

import com.lowagie.text.Document;

import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.unibuddy.backend.model.ForumAnswer;
import com.unibuddy.backend.model.ForumQuestion;
import com.unibuddy.backend.repository.ForumAnswerRepository;
import com.unibuddy.backend.repository.ForumQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ForumQuestionRepository questionRepo;
    private final ForumAnswerRepository answerRepo;

    public byte[] generateRecommendedQAPDF(Long questionId) {
        ForumQuestion q = questionRepo.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
                
        List<ForumAnswer> allAnswers = answerRepo.findByQuestionId(questionId);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            
            document.open();
            
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Academic Forum - Q&A Report", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(title);
            
            document.add(new Paragraph("\n"));
            
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            
            // Question Section
            document.add(new Paragraph("Question Title: " + q.getTitle(), headerFont));
            document.add(new Paragraph("Module: " + q.getModuleCode(), normalFont));
            document.add(new Paragraph("Author: " + q.getUniversityId(), normalFont));
            document.add(new Paragraph("Upvotes: " + q.getUpvotes() + " | Downvotes: " + q.getDownvotes(), normalFont));
            document.add(new Paragraph("\n" + q.getContent(), normalFont));
            
            document.add(new Paragraph("\n------------------------------------------------------------\n"));
            
            // All Answers Section
            if (allAnswers.isEmpty()) {
                document.add(new Paragraph("No answers available for this question yet.", normalFont));
            } else {
                document.add(new Paragraph("Answers (" + allAnswers.size() + ")", headerFont));
                document.add(new Paragraph("\n"));

                // Sort answers: most recommended first, then by upvotes descending
                allAnswers.sort((a1, a2) -> {
                    if (a1.isMostRecommended() && !a2.isMostRecommended()) return -1;
                    if (!a1.isMostRecommended() && a2.isMostRecommended()) return 1;
                    return Integer.compare(a2.getUpvotes(), a1.getUpvotes());
                });

                int answerNum = 1;
                for (ForumAnswer answer : allAnswers) {
                    if (answer.isMostRecommended()) {
                        Font badgeFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new java.awt.Color(0, 102, 0));
                        document.add(new Paragraph("★ MOST RECOMMENDED ANSWER ★", badgeFont));
                    } else {
                        document.add(new Paragraph("Answer #" + answerNum, headerFont));
                    }
                    document.add(new Paragraph("Author: " + answer.getUniversityId(), normalFont));
                    document.add(new Paragraph("Upvotes: " + answer.getUpvotes(), normalFont));
                    document.add(new Paragraph(answer.getContent(), normalFont));
                    document.add(new Paragraph("\n"));
                    answerNum++;
                }
            }
            
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF report", e);
        }
    }
}
