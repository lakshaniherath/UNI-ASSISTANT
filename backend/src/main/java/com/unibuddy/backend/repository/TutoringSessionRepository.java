package com.unibuddy.backend.repository;

import com.unibuddy.backend.model.TutoringSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface TutoringSessionRepository extends JpaRepository<TutoringSession, Long> {
    
    // Find all bookings for a specific student (History)
    List<TutoringSession> findByStudentIdOrderBySessionDateDesc(String studentId);

    // Find all sessions a student is teaching
    List<TutoringSession> findByTutorIdOrderBySessionDateDesc(String tutorId);

    // The Overlap Checker: Returns true if the tutor is already booked
    @Query("SELECT COUNT(t) > 0 FROM TutoringSession t WHERE t.tutorId = :tutorId " +
           "AND t.sessionDate = :date " +
           "AND t.status = 'SCHEDULED' " +
           "AND (t.startTime < :endTime AND t.endTime > :startTime)")
    boolean isTutorBooked(
            @Param("tutorId") String tutorId, 
            @Param("date") LocalDate date, 
            @Param("startTime") LocalTime startTime, 
            @Param("endTime") LocalTime endTime);
}
