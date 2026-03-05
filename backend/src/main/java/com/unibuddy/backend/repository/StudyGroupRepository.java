package com.unibuddy.backend.repository;

import com.unibuddy.backend.model.StudyGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {
    // Skills අනුව හරි නම අනුව හරි search කරන්න පස්සේ මෙතනට methods එකතු කරමු
}