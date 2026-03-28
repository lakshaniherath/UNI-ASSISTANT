package com.unibuddy.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
public class ForumAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long questionId;
    private String universityId;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private int upvotes = 0;
    private boolean isMostRecommended = false; // For Reputation Badge

    @JsonIgnore
    @Column(columnDefinition = "TEXT")
    private String votedUsersStr = "";

    public String getVoteType(String userId) {
        if (votedUsersStr == null) return null;
        for (String entry : votedUsersStr.split(",")) {
            if (entry.startsWith(userId + ":")) {
                return entry.split(":")[1];
            }
        }
        return null;
    }

    public void removeVote(String userId, String type) {
        if (votedUsersStr != null) {
            votedUsersStr = votedUsersStr.replace(userId + ":" + type + ",", "");
        }
    }

    public void addVotedUser(String userId, String type) {
        if (votedUsersStr == null) votedUsersStr = "";
        votedUsersStr += userId + ":" + type + ",";
    }
}
