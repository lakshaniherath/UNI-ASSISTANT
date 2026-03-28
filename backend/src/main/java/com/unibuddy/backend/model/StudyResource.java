package com.unibuddy.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_resources")
@Data
public class StudyResource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String uploaderId;
    private String moduleCode;
    private String category;
    private String title;
    private String description;
    private String fileName;
    private String fileType;
    private String firebaseStorageUrl;
    private int upvotes = 0;
    private int downvotes = 0;
    private int downloads = 0;
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
