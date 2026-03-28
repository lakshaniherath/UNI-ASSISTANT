package com.unibuddy.backend.service;

import com.unibuddy.backend.dto.CampusEventDTO;
import com.unibuddy.backend.model.CampusEvent;
import com.unibuddy.backend.model.User;
import com.unibuddy.backend.repository.CampusEventRepository;
import com.unibuddy.backend.repository.EventRegistrationRepository;
import com.unibuddy.backend.repository.UserRepository;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CampusEventService {

    private final CampusEventRepository campusEventRepository;
    private final UserRepository userRepository;
    private final EventRegistrationRepository eventRegistrationRepository;

    public CampusEventService(CampusEventRepository campusEventRepository,
                              UserRepository userRepository,
                              EventRegistrationRepository eventRegistrationRepository) {
        this.campusEventRepository = campusEventRepository;
        this.userRepository = userRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
    }

    public List<CampusEventDTO> getAllUpcomingEvents() {
        return campusEventRepository.findByEventDateGreaterThanEqualOrderByEventDateAscStartTimeAsc(LocalDate.now())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CampusEventDTO createEvent(CampusEventDTO dto, String organizerUnivId) {
        User organizer = userRepository.findByUniversityId(organizerUnivId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        CampusEvent event = new CampusEvent();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setLocation(dto.getLocation());
        event.setEventDate(dto.getEventDate());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setType(dto.getType());
        event.setOrganizer(organizer);

        event = campusEventRepository.save(event);
        return mapToDTO(event);
    }
    
    public CampusEventDTO updateEvent(Long id, CampusEventDTO dto) {
        CampusEvent event = campusEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
                
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setLocation(dto.getLocation());
        event.setEventDate(dto.getEventDate());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setType(dto.getType());
        
        event = campusEventRepository.save(event);
        return mapToDTO(event);
    }

    public void deleteEvent(Long id) {
        campusEventRepository.deleteById(id);
    }

    public CampusEventDTO getEventById(Long id) {
        return campusEventRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public byte[] generateMonthlyEventCalendarPdf() {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);
        
        List<CampusEvent> events = campusEventRepository.findByEventDateBetweenOrderByEventDateAscStartTimeAsc(startOfMonth, endOfMonth);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Monthly Event Calendar - " + startOfMonth.getMonth() + " " + startOfMonth.getYear(), titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.addCell("Date");
            table.addCell("Time");
            table.addCell("Title");
            table.addCell("Location");

            for (CampusEvent event : events) {
                table.addCell(event.getEventDate().toString());
                table.addCell(event.getStartTime().toString() + " - " + event.getEndTime().toString());
                table.addCell(event.getTitle());
                table.addCell(event.getLocation());
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private CampusEventDTO mapToDTO(CampusEvent event) {
        CampusEventDTO dto = new CampusEventDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setLocation(event.getLocation());
        dto.setEventDate(event.getEventDate());
        dto.setStartTime(event.getStartTime());
        dto.setEndTime(event.getEndTime());
        dto.setType(event.getType());
        dto.setOrganizerName(event.getOrganizer().getName());
        dto.setOrganizerUniversityId(event.getOrganizer().getUniversityId());
        dto.setAttendeesCount(eventRegistrationRepository.countByEvent(event));
        return dto;
    }
}
