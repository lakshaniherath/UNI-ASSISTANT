package com.unibuddy.backend.repository;

import com.unibuddy.backend.model.ForumAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumAnswerRepository extends JpaRepository<ForumAnswer, Long> {
    List<ForumAnswer> findByQuestionId(Long questionId);
    ForumAnswer findTopByQuestionIdOrderByUpvotesDesc(Long questionId);
}
