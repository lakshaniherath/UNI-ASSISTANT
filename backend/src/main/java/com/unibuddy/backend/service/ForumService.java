package com.unibuddy.backend.service;

import com.unibuddy.backend.model.ForumAnswer;
import com.unibuddy.backend.model.ForumQuestion;
import com.unibuddy.backend.repository.ForumAnswerRepository;
import com.unibuddy.backend.repository.ForumQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumQuestionRepository questionRepository;
    private final ForumAnswerRepository answerRepository;

    public ForumQuestion createQuestion(ForumQuestion question) {
        question.setCreatedAt(LocalDateTime.now());
        question.setUpvotes(0);
        question.setDownvotes(0);
        return questionRepository.save(question);
    }

    public List<ForumQuestion> getQuestionsByModule(String moduleCode) {
        return questionRepository.findByModuleCode(moduleCode);
    }

    @Transactional
    public ForumQuestion updateQuestion(Long id, ForumQuestion updated, String userId) {
        ForumQuestion existing = questionRepository.findById(id).orElseThrow(() -> new RuntimeException("Question not found"));
        if (!existing.getUniversityId().trim().equalsIgnoreCase(userId.trim())) {
            throw new RuntimeException("Unauthorized Access: You are only permitted to edit your own questions.");
        }
        existing.setTitle(updated.getTitle());
        existing.setContent(updated.getContent());
        return questionRepository.save(existing);
    }

    @Transactional
    public void deleteQuestion(Long id, String userId) {
        ForumQuestion existing = questionRepository.findById(id).orElseThrow(() -> new RuntimeException("Question not found"));
        if (!existing.getUniversityId().trim().equalsIgnoreCase(userId.trim())) {
            throw new RuntimeException("Unauthorized Access: You are only permitted to delete your own questions.");
        }
        questionRepository.delete(existing);
    }

    @Transactional
    public ForumQuestion voteQuestion(Long id, boolean upvote, String userId) {
        ForumQuestion existing = questionRepository.findById(id).orElseThrow();
        String existingVoteType = existing.getVoteType(userId);
        String newVoteType = upvote ? "U" : "D";

        if (existingVoteType != null) {
            if (existingVoteType.equals(newVoteType)) {
                // Undo vote
                if (upvote) {
                    existing.setUpvotes(Math.max(0, existing.getUpvotes() - 1));
                } else {
                    existing.setDownvotes(Math.max(0, existing.getDownvotes() - 1));
                }
                existing.removeVote(userId, existingVoteType);
            } else {
                throw new RuntimeException("Action Denied: You have already " + (existingVoteType.equals("U") ? "upvoted" : "downvoted") + " this question.");
            }
        } else {
            // New vote
            if (upvote) {
                existing.setUpvotes(existing.getUpvotes() + 1);
            } else {
                // Prevent votes from going below 0
                int netVotes = existing.getUpvotes() - existing.getDownvotes();
                if (netVotes <= 0) {
                    return existing;
                }
                existing.setDownvotes(existing.getDownvotes() + 1);
            }
            existing.addVotedUser(userId, newVoteType);
        }
        
        return questionRepository.save(existing);
    }

    // AI-Powered Duplicate Detector
    public List<ForumQuestion> findPotentialDuplicates(String newTitle, String moduleCode) {
        List<ForumQuestion> moduleQuestions = questionRepository.findByModuleCode(moduleCode);
        return moduleQuestions.stream()
                .filter(q -> calculateSimilarity(q.getTitle(), newTitle) > 0.3)
                .limit(3)
                .collect(Collectors.toList());
    }

    private double calculateSimilarity(String title1, String title2) {
        if (title1 == null || title2 == null) return 0.0;
        
        String t1Lower = title1.toLowerCase().trim();
        String t2Lower = title2.toLowerCase().trim();
        
        // Exact match
        if (t1Lower.equals(t2Lower)) return 1.0;
        
        // Substring containment — if one title contains the other
        if (t1Lower.contains(t2Lower) || t2Lower.contains(t1Lower)) return 0.8;
        
        // Jaccard word similarity
        Set<String> words1 = new HashSet<>(Arrays.asList(t1Lower.split("\\W+")));
        Set<String> words2 = new HashSet<>(Arrays.asList(t2Lower.split("\\W+")));
        
        // Remove empty strings
        words1.remove("");
        words2.remove("");
        
        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);
        
        Set<String> union = new HashSet<>(words1);
        union.addAll(words2);
        
        if (union.isEmpty()) return 0.0;
        
        double jaccardScore = (double) intersection.size() / union.size();
        
        // Also check partial word matches (e.g. "dijkstra" matches "dijkstras")
        if (jaccardScore < 0.3) {
            long partialMatches = words1.stream()
                    .filter(w1 -> words2.stream().anyMatch(w2 -> w1.contains(w2) || w2.contains(w1)))
                    .count();
            double partialScore = (double) partialMatches / Math.max(words1.size(), words2.size());
            jaccardScore = Math.max(jaccardScore, partialScore * 0.7);
        }
        
        return jaccardScore;
    }

    // Answers operations
    public ForumAnswer createAnswer(ForumAnswer answer) {
        answer.setUpvotes(0);
        answer.setMostRecommended(false);
        return answerRepository.save(answer);
    }

    public List<ForumAnswer> getAnswersForQuestion(Long questionId) {
        return answerRepository.findByQuestionId(questionId);
    }

    @Transactional
    public ForumAnswer updateAnswer(Long id, ForumAnswer updated, String userId) {
        ForumAnswer existing = answerRepository.findById(id).orElseThrow();
        if (!existing.getUniversityId().trim().equalsIgnoreCase(userId.trim())) {
            throw new RuntimeException("Unauthorized Access: You are only permitted to edit your own answers.");
        }
        existing.setContent(updated.getContent());
        return answerRepository.save(existing);
    }

    @Transactional
    public void deleteAnswer(Long id, String userId) {
        ForumAnswer existing = answerRepository.findById(id).orElseThrow();
        if (!existing.getUniversityId().trim().equalsIgnoreCase(userId.trim())) {
            throw new RuntimeException("Unauthorized Access: You are only permitted to delete your own answers.");
        }
        answerRepository.delete(existing);
        updateReputationBadge(existing.getQuestionId());
    }

    @Transactional
    public ForumAnswer voteAnswer(Long id, boolean upvote, String userId) {
        ForumAnswer existing = answerRepository.findById(id).orElseThrow();
        String existingVoteType = existing.getVoteType(userId);
        String newVoteType = upvote ? "U" : "D";

        if (existingVoteType != null) {
            if (existingVoteType.equals(newVoteType)) {
                // Undo vote
                if (upvote) {
                    existing.setUpvotes(Math.max(0, existing.getUpvotes() - 1));
                } else {
                    existing.setUpvotes(Math.max(0, existing.getUpvotes() + 1)); // Undo a downvote if model tracks it. Wait, model only tracks upvotes.
                }
                existing.removeVote(userId, existingVoteType);
            } else {
                throw new RuntimeException("Action Denied: You have already " + (existingVoteType.equals("U") ? "upvoted" : "downvoted") + " this answer.");
            }
        } else {
            // New vote
            if (upvote) {
                existing.setUpvotes(existing.getUpvotes() + 1);
            } else {
                // Prevent votes from going below 0
                if (existing.getUpvotes() <= 0) {
                    return existing;
                }
                existing.setUpvotes(existing.getUpvotes() - 1);
            }
            existing.addVotedUser(userId, newVoteType);
        }
        
        ForumAnswer saved = answerRepository.save(existing);
        updateReputationBadge(saved.getQuestionId());
        return saved;
    }

    private void updateReputationBadge(Long questionId) {
        List<ForumAnswer> answers = answerRepository.findByQuestionId(questionId);
        if (answers.isEmpty()) return;

        // Reset all badges
        for (ForumAnswer answer : answers) {
            answer.setMostRecommended(false);
        }

        // Find best
        ForumAnswer bestAnswer = answers.stream()
                .max((a1, a2) -> Integer.compare(a1.getUpvotes(), a2.getUpvotes()))
                .orElse(null);

        if (bestAnswer != null && bestAnswer.getUpvotes() > 0) {
            bestAnswer.setMostRecommended(true);
        }

        answerRepository.saveAll(answers);
    }
}
