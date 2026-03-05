package com.unibuddy.backend.repository;

import com.unibuddy.backend.model.JoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {

    // 🚀 Group Leader ට තමන්ගේ group එකට ආපු requests විතරක් බලන්න මේක ඕනේ වෙනවා
    List<JoinRequest> findByGroupId(Long groupId);

    // 🚀 Status (PENDING / ACCEPTED) අනුව requests filter කිරීමට
    List<JoinRequest> findByGroupIdAndStatus(Long groupId, String status);

    // 🚀 යම් ශිෂ්‍යයෙක් දැනටමත් මේ group එකට request එකක් යවලාද බලන්න (DuplicateRequests වැළැක්වීමට)
    boolean existsByGroupIdAndStudentIdAndStatus(Long groupId, String studentId, String status);
}