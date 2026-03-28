package com.unibuddy.backend.repository;

import com.unibuddy.backend.model.StudyResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyResourceRepository extends JpaRepository<StudyResource, Long> {
    List<StudyResource> findByModuleCode(String moduleCode);
    List<StudyResource> findTop10ByModuleCodeOrderByDownloadsDesc(String moduleCode);
    List<StudyResource> findByModuleCodeAndCategory(String moduleCode, String category);
}
