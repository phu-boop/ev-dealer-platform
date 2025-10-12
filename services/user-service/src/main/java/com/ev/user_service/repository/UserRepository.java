package com.ev.user_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ev.user_service.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    List<User> findAll();
    Boolean existsByEmail(String email);
    Boolean existsByPhone(String phone);
    Optional<User> findByEmail(String email);
}
