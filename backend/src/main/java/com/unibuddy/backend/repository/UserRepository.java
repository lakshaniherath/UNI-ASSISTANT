package com.unibuddy.backend.repository;

import com.unibuddy.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Email eken user wa hoyanna (Login weddi ona wenawa)
    Optional<User> findByEmail(String email);



    // University ID eken user wa hoyanna
    Optional<User> findByUniversityId(String universityId);
}