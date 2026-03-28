package com.unibuddy.backend.repository;

import com.unibuddy.backend.model.ForumQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumQuestionRepository extends JpaRepository<ForumQuestion, Long> {
    List<ForumQuestion> findByModuleCode(String moduleCode);
}
