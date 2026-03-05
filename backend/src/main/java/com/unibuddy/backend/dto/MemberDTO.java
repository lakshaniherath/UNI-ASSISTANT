package com.unibuddy.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MemberDTO {
    private String universityId;
    private String name;
    private String email;
    private String subgroup;
    private String cgpa;
    private String skills;
    private boolean isLeader;
}
