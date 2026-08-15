package com.wildsight.backend.repository;

import com.wildsight.backend.entity.User;
import com.wildsight.backend.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    Optional<UserRole> findByUser(User user);

}