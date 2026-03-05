package com.unibuddy.backend.repository;

import com.unibuddy.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUniversityId(String universityId);

    // එකම subgroup එකේ සිටින සිසුන් ලැයිස්තුවක් ලබා ගැනීමට (අවශ්‍ය නම්)
    List<User> findBySubgroup(String subgroup);
}