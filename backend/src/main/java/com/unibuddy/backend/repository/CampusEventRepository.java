package com.unibuddy.backend.repository;

import com.unibuddy.backend.model.CampusEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CampusEventRepository extends JpaRepository<CampusEvent, Long> {
    List<CampusEvent> findByEventDateBetweenOrderByEventDateAscStartTimeAsc(LocalDate startDate, LocalDate endDate);
    List<CampusEvent> findByEventDateGreaterThanEqualOrderByEventDateAscStartTimeAsc(LocalDate date);
    List<CampusEvent> findAllByOrderByEventDateAscStartTimeAsc();
}
