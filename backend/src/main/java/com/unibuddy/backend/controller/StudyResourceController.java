package com.unibuddy.backend.controller;

import com.unibuddy.backend.model.StudyResource;
import com.unibuddy.backend.service.StudyResourceService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class StudyResourceController {

    @Autowired
    private StudyResourceService studyResourceService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StudyResource> uploadResource(
            @RequestParam("file") MultipartFile file,
            @RequestParam("uploaderId") String uploaderId,
            @RequestParam("moduleCode") String moduleCode,
            @RequestParam("category") String category,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description) {
        try {
            StudyResource resource = new StudyResource();
            resource.setUploaderId(uploaderId);
            resource.setModuleCode(moduleCode);
            resource.setCategory(category);
            resource.setTitle(title);
            resource.setDescription(description);

            return ResponseEntity.ok(studyResourceService.uploadFileToCloud(file, resource));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/module/{moduleCode}")
    public ResponseEntity<List<StudyResource>> getModuleResources(@PathVariable String moduleCode) {
        List<StudyResource> resources = studyResourceService.getResourcesByModule(moduleCode);
        return ResponseEntity.ok(resources);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudyResource> updateResource(
            @PathVariable Long id,
            @RequestParam String uploaderId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description) {
        try {
            StudyResource updated = studyResourceService.updateResourceMetadata(id, description, title, uploaderId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(
            @PathVariable Long id,
            @RequestParam String uploaderId) {
        try {
            studyResourceService.deleteResource(id, uploaderId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PutMapping("/{id}/upvote")
    public ResponseEntity<StudyResource> upvoteResource(@PathVariable Long id) {
        return ResponseEntity.ok(studyResourceService.incrementUpvote(id));
    }
    
    @PutMapping("/{id}/downvote")
    public ResponseEntity<StudyResource> downvoteResource(@PathVariable Long id) {
        return ResponseEntity.ok(studyResourceService.downvote(id));
    }

    @PutMapping("/{id}/download")
    public ResponseEntity<StudyResource> registerDownload(@PathVariable Long id) {
        return ResponseEntity.ok(studyResourceService.incrementDownload(id));
    }

    @GetMapping("/module/{moduleCode}/zip")
    public void downloadModuleZip(@PathVariable String moduleCode, HttpServletResponse response) throws IOException {
        response.setContentType("application/zip");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + moduleCode + "_resources.zip\"");
        studyResourceService.downloadModuleResourcesAsZip(moduleCode, response.getOutputStream());
        response.flushBuffer();
    }

    @GetMapping("/module/{moduleCode}/report")
    public ResponseEntity<byte[]> getPopularityReport(@PathVariable String moduleCode) {
        byte[] pdfBytes = studyResourceService.generatePopularityReport(moduleCode);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", moduleCode + "_usage_report.pdf");
        
        // Cache busting
        headers.setCacheControl("no-cache, no-store, must-revalidate");
        headers.setPragma("no-cache");
        headers.setExpires(0);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
