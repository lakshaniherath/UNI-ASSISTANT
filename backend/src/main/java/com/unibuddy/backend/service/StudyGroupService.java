package com.unibuddy.backend.service;

import com.unibuddy.backend.dto.JoinRequestResponseDTO;
import com.unibuddy.backend.dto.StudyGroupResponseDTO;
import com.unibuddy.backend.model.JoinRequest;
import com.unibuddy.backend.model.StudyGroup;
import com.unibuddy.backend.model.User;
import com.unibuddy.backend.repository.JoinRequestRepository;
import com.unibuddy.backend.repository.StudyGroupRepository;
import com.unibuddy.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class StudyGroupService {

    private final StudyGroupRepository studyGroupRepository;
    private final UserRepository userRepository;
    private final JoinRequestRepository joinRequestRepository; // 🚀 අලුතින් එකතු කළා

    public StudyGroupService(StudyGroupRepository studyGroupRepository,
                             UserRepository userRepository,
                             JoinRequestRepository joinRequestRepository) {
        this.studyGroupRepository = studyGroupRepository;
        this.userRepository = userRepository;
        this.joinRequestRepository = joinRequestRepository;
    }

    // 🚀 Match Score Logic
    public List<StudyGroupResponseDTO> getGroupsWithMatchScore(String universityId) {
        User user = userRepository.findByUniversityId(universityId)
                .orElseThrow(() -> new RuntimeException("User not found: " + universityId));

        List<StudyGroup> allGroups = studyGroupRepository.findAll();
        List<StudyGroupResponseDTO> responseList = new ArrayList<>();

        for (StudyGroup group : allGroups) {
            double skillScore = 0;
            double cgpaScore = 0;

            if (group.getRequiredSkills() != null && !group.getRequiredSkills().isEmpty() && user.getMySkills() != null) {
                long matchingSkillsCount = user.getMySkills().stream()
                        .filter(skill -> group.getRequiredSkills().contains(skill))
                        .count();
                skillScore = (double) matchingSkillsCount / group.getRequiredSkills().size();
            }

            if (user.getCgpa() != null && user.getCgpa().equals(group.getTargetCGPA())) {
                cgpaScore = 1.0;
            }

            double finalScore = (skillScore * 0.7) + (cgpaScore * 0.3);
            int finalPercentage = (int) (finalScore * 100);

            responseList.add(new StudyGroupResponseDTO(group, finalPercentage));
        }

        responseList.sort((a, b) -> b.getMatchScore() - a.getMatchScore());
        return responseList;
    }

    // 🚀 Join Request එකක් යැවීමේ නව පහසුකම
    public String sendJoinRequest(Long groupId, String studentId) {
        studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        userRepository.findByUniversityId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // දැනටමත් group එකක සාමාජිකයෙක්දැයි බැලීම
        if (isStudentInAnyGroup(studentId)) {
            return "Error: You are already a member of a group.";
        }

        // දැනටමත් request එකක් යවා ඇත්දැයි බැලීම
        boolean alreadyRequested = joinRequestRepository.findAll().stream()
                .anyMatch(r -> r.getGroupId().equals(groupId) && r.getStudentId().equals(studentId) && r.getStatus().equals("PENDING"));

        if (alreadyRequested) {
            return "Error: You have already sent a request to this group.";
        }

        JoinRequest request = new JoinRequest();
        request.setGroupId(groupId);
        request.setStudentId(studentId);
        request.setStatus("PENDING");

        joinRequestRepository.save(request);
        return "Success: Join request sent to the group leader!";
    }

    // 🚀 Group Leader හට Request එක Accept කිරීමට ඇති Method එක
    public String acceptJoinRequest(Long requestId) {
        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        StudyGroup group = studyGroupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        int currentMembers = (group.getCurrentMembers() != null) ? group.getCurrentMembers() : 0;
        int maxMembers = (group.getMaxMembers() != null) ? group.getMaxMembers() : 4;

        if (currentMembers >= maxMembers) {
            return "Error: Group is already full.";
        }

        // සාමාජිකයා එකතු කිරීම
        if (group.getMemberIds() == null) group.setMemberIds(new ArrayList<>());
        group.getMemberIds().add(request.getStudentId());
        group.setCurrentMembers(currentMembers + 1);
        studyGroupRepository.save(group);

        // Request එක සක්‍රිය කිරීම
        request.setStatus("ACCEPTED");
        joinRequestRepository.save(request);

        return "Success: Member added to the group!";
    }

    // 🚀 Group Leader හට Pending Requests ලබා ගැනීම (Live User Data සමඟ)
    public List<JoinRequestResponseDTO> getPendingRequestsByGroupId(Long groupId) {
        // 1. Fetch all PENDING requests for this group
        List<JoinRequest> requests = joinRequestRepository.findByGroupId(groupId).stream()
                .filter(r -> r.getStatus().equals("PENDING"))
                .toList();

        // 2. Map each request to our DTO with LIVE user data
        return requests.stream().map(request -> {
            User user = userRepository.findByUniversityId(request.getStudentId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return new JoinRequestResponseDTO(
                    request.getId(),
                    user.getUniversityId(),
                    user.getName(),
                    user.getMySkills() != null ? String.join(", ", user.getMySkills()) : "No skills added",
                    user.getCgpa() != null ? user.getCgpa() : "No CGPA"
            );
        }).toList();
    }

    public StudyGroup createGroup(StudyGroup group, String creatorId) {
        try {
            validateGroupData(group);
            group.setCreatorId(creatorId);
            group.setCurrentMembers(1);
            if (group.getMaxMembers() == null || group.getMaxMembers() <= 0) group.setMaxMembers(4);
            if (group.getMemberIds() == null) group.setMemberIds(new ArrayList<>());
            group.getMemberIds().add(creatorId);
            return studyGroupRepository.save(group);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create group: " + e.getMessage(), e);
        }
    }

    public List<StudyGroup> getAllGroups() {
        return studyGroupRepository.findAll();
    }

    private void validateGroupData(StudyGroup group) {
        if (group.getGroupName() == null || group.getGroupName().trim().isEmpty()) throw new IllegalArgumentException("Group name required");
        if (group.getSubgroup() == null || group.getSubgroup().trim().isEmpty()) throw new IllegalArgumentException("Subgroup required");
        if (group.getRequiredSkills() == null || group.getRequiredSkills().isEmpty()) throw new IllegalArgumentException("Skills required");
        if (group.getTargetCGPA() == null || group.getTargetCGPA().trim().isEmpty()) throw new IllegalArgumentException("Target CGPA required");
    }

    private boolean isStudentInAnyGroup(String studentId) {
        return studyGroupRepository.findAll().stream()
                .anyMatch(g -> g.getMemberIds() != null && g.getMemberIds().contains(studentId));
    }
}