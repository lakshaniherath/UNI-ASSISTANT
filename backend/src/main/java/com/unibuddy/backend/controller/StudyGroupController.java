package com.unibuddy.backend.controller;

import com.unibuddy.backend.dto.JoinRequestResponseDTO;
import com.unibuddy.backend.dto.MemberDTO;
import com.unibuddy.backend.dto.StudyGroupResponseDTO;
import com.unibuddy.backend.model.StudyGroup;
import com.unibuddy.backend.service.StudyGroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class StudyGroupController {

    private final StudyGroupService studyGroupService;

    public StudyGroupController(StudyGroupService studyGroupService) {
        this.studyGroupService = studyGroupService;
    }

    // 1. අලුත් Study Group එකක් හදන්න (Target CGPA දත්ත සහිතව)
    @PostMapping("/create")
    public ResponseEntity<StudyGroup> createGroup(@RequestBody StudyGroup group, @RequestParam String creatorId) {
        StudyGroup createdGroup = studyGroupService.createGroup(group, creatorId);
        return ResponseEntity.ok(createdGroup);
    }

    // 2. 🚀 Recommended Groups (Match Score සමඟ) ලබාගැනීම
    @GetMapping("/recommended/{universityId}")
    public ResponseEntity<List<StudyGroupResponseDTO>> getRecommendedGroups(@PathVariable String universityId) {
        List<StudyGroupResponseDTO> recommended = studyGroupService.getGroupsWithMatchScore(universityId);
        return ResponseEntity.ok(recommended);
    }

    // 3. 🚀 Join Request එකක් යැවීමට ඇති නව Endpoint එක
    // කෙලින්ම join වෙනවා වෙනුවට ශිෂ්‍යයා දැන් කරන්නේ request එකක් යැවීමයි
    @PostMapping("/request-to-join")
    public ResponseEntity<String> sendJoinRequest(
            @RequestParam Long groupId,
            @RequestParam String studentId) {

        String result = studyGroupService.sendJoinRequest(groupId, studentId);
        if (result.startsWith("Success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // 4. 🚀 Group Leader හට Request එක Accept කිරීමට ඇති Endpoint එක
    @PostMapping("/accept-request/{requestId}")
    public ResponseEntity<String> acceptRequest(@PathVariable Long requestId) {
        String result = studyGroupService.acceptJoinRequest(requestId);
        if (result.startsWith("Success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // 5. 🚀 Group Leader හට Request එක Reject කිරීමට ඇති Endpoint එක
    @PostMapping("/reject-request/{requestId}")
    public ResponseEntity<String> rejectRequest(@PathVariable Long requestId) {
        String result = studyGroupService.rejectJoinRequest(requestId);
        return ResponseEntity.ok(result);
    }

    // 6. 🚀 Pending Join Requests ලබා ගැනීම (Group Leader සඳහා - Live Data)
    @GetMapping("/{groupId}/requests")
    public ResponseEntity<List<JoinRequestResponseDTO>> getPendingRequests(@PathVariable Long groupId) {
        List<JoinRequestResponseDTO> requests = studyGroupService.getPendingRequestsByGroupId(groupId);
        return ResponseEntity.ok(requests);
    }

    // 7. සියලුම Study Groups ලැයිස්තුව (Optional)
    @GetMapping("/all")
    public ResponseEntity<List<StudyGroup>> getAllGroups() {
        return ResponseEntity.ok(studyGroupService.getAllGroups());
    }

    // 8. 🚀 Group එකේ සාමාජිකයන්ගේ Live Details ලබා ගැනීම
    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<MemberDTO>> getGroupMembers(@PathVariable Long groupId) {
        List<MemberDTO> members = studyGroupService.getGroupMembers(groupId);
        return ResponseEntity.ok(members);
    }

    // 9. 🚀 Group Leader හට සාමාජිකයෙක් ඉවත් කිරීම
    @PostMapping("/{groupId}/remove-member")
    public ResponseEntity<String> removeMember(
            @PathVariable Long groupId,
            @RequestParam String memberId) {
        String result = studyGroupService.removeMember(groupId, memberId);
        if (result.startsWith("Success")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }

    // 10. 🚀 Group Leader හට Group එක Delete කිරීම
    @DeleteMapping("/{groupId}")
    public ResponseEntity<String> deleteGroup(
            @PathVariable Long groupId,
            @RequestParam String requesterId) {
        String result = studyGroupService.deleteGroup(groupId, requesterId);
        if (result.startsWith("Success")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }

    // 11. 🚀 සාමාජිකයෙක් Group එකෙන් ඉවත්වීම
    @PostMapping("/{groupId}/leave")
    public ResponseEntity<String> leaveGroup(
            @PathVariable Long groupId,
            @RequestParam String studentId) {
        String result = studyGroupService.leaveGroup(groupId, studentId);
        if (result.startsWith("Success")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }
}