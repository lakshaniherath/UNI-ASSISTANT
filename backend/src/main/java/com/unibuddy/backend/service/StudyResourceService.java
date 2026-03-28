package com.unibuddy.backend.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.unibuddy.backend.model.StudyResource;
import com.unibuddy.backend.repository.StudyResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.StorageClient;
import org.springframework.web.multipart.MultipartFile;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class StudyResourceService {

    @Autowired
    private StudyResourceRepository studyResourceRepository;

    public StudyResource saveResource(StudyResource resource) {
        resource.setUploadedAt(LocalDateTime.now());
        if (resource.getCategory() == null) {
            resource.setCategory("Uncategorized");
        }
        return studyResourceRepository.save(resource);
    }

    public StudyResource uploadFileToFirebase(MultipartFile file, StudyResource metadata) throws IOException {
        System.out.println("DEBUG: Starting upload for: " + file.getOriginalFilename());
        
        Bucket bucket = StorageClient.getInstance().bucket(); 
        if (bucket == null) {
            System.out.println("DEBUG: BUCKET IS NULL! Check FirebaseConfig.");
            throw new RuntimeException("Storage Bucket not initialized");
        }
        
        String fileName = metadata.getModuleCode() + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        System.out.println("DEBUG: Uploading to path: " + fileName);
        
        bucket.create(fileName, file.getBytes(), file.getContentType());
        System.out.println("DEBUG: Firebase create successful!");
        
        // Construct the URL using the bucket name automatically
        String url = String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                bucket.getName(),
                URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20"));
        
        metadata.setFirebaseStorageUrl(url);
        metadata.setFileName(file.getOriginalFilename());
        metadata.setFileType(file.getContentType());
        metadata.setUploadedAt(LocalDateTime.now());

        return studyResourceRepository.save(metadata);
    }

    public List<StudyResource> getResourcesByModule(String moduleCode) {
        return studyResourceRepository.findByModuleCode(moduleCode);
    }
    
    public List<StudyResource> getResourcesByModuleAndCategory(String moduleCode, String category) {
        return studyResourceRepository.findByModuleCodeAndCategory(moduleCode, category);
    }

    public Optional<StudyResource> getResourceById(Long id) {
        return studyResourceRepository.findById(id);
    }

    public StudyResource incrementUpvote(Long id) {
        StudyResource resource = studyResourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        resource.setUpvotes(resource.getUpvotes() + 1);
        return studyResourceRepository.save(resource);
    }
    
    public StudyResource downvote(Long id) {
        StudyResource resource = studyResourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        resource.setUpvotes(resource.getUpvotes() - 1);
        return studyResourceRepository.save(resource);
    }

    public StudyResource incrementDownload(Long id) {
        StudyResource resource = studyResourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        resource.setDownloads(resource.getDownloads() + 1);
        return studyResourceRepository.save(resource);
    }

    public void deleteResource(Long id, String uploaderId) {
        StudyResource resource = studyResourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        
        if (!resource.getUploaderId().equals(uploaderId)) {
            throw new RuntimeException("Unauthorized Access: You lack the necessary permissions to delete this resource.");
        }
        studyResourceRepository.delete(resource);
    }

    public StudyResource updateResourceMetadata(Long id, String description, String title, String uploaderId) {
        StudyResource resource = studyResourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (!resource.getUploaderId().equals(uploaderId)) {
            throw new RuntimeException("Unauthorized Access: You lack the necessary permissions to edit this resource.");
        }
        
        if (description != null) resource.setDescription(description);
        if (title != null) resource.setTitle(title);

        return studyResourceRepository.save(resource);
    }

    public void downloadModuleResourcesAsZip(String moduleCode, OutputStream outputStream) throws IOException {
        List<StudyResource> resources = studyResourceRepository.findByModuleCode(moduleCode);
        try (ZipOutputStream zipOut = new ZipOutputStream(outputStream)) {
            for (StudyResource resource : resources) {
                if (resource.getFirebaseStorageUrl() == null || resource.getFirebaseStorageUrl().isEmpty()) {
                    continue;
                }
                try {
                    URL targetUrl = new URL(resource.getFirebaseStorageUrl());
                    try (InputStream in = targetUrl.openStream()) {
                        String zipEntryName = resource.getCategory() + "/" + resource.getFileName();
                        ZipEntry zipEntry = new ZipEntry(zipEntryName);
                        zipOut.putNextEntry(zipEntry);

                        byte[] buffer = new byte[1024];
                        int length;
                        while ((length = in.read(buffer)) >= 0) {
                            zipOut.write(buffer, 0, length);
                        }
                        zipOut.closeEntry();
                    }
                } catch (Exception e) {
                    System.err.println("Failed to download file for zip: " + resource.getFileName());
                }
            }
        }
    }

    public byte[] generatePopularityReport(String moduleCode) {
        List<StudyResource> topResources = studyResourceRepository.findTop10ByModuleCodeOrderByDownloadsDesc(moduleCode);
        
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Usage Report - " + moduleCode + " Resources", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 2f, 1f, 1f});

            addTableHeader(table);
            
            for (StudyResource resource : topResources) {
                table.addCell(new Phrase(resource.getTitle() != null ? resource.getTitle() : resource.getFileName()));
                table.addCell(new Phrase(resource.getCategory()));
                table.addCell(new Phrase(String.valueOf(resource.getDownloads())));
                table.addCell(new Phrase(String.valueOf(resource.getUpvotes())));
            }

            document.add(table);
            document.close();
            return baos.toByteArray();
        } catch (DocumentException | IOException e) {
            throw new RuntimeException("Failed to generate report", e);
        }
    }

    private void addTableHeader(PdfPTable table) {
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        String[] headers = {"Title / File Name", "Category", "Downloads", "Upvotes"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
            table.addCell(cell);
        }
    }
}
