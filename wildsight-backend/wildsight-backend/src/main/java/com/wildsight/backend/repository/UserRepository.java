package com.wildsight.backend.repository;

import com.wildsight.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {


    Optional<User> findByEmail(String email);


    boolean existsByEmail(String email);



    // ==============================
    // ADMIN DASHBOARD USER ANALYTICS
    // ==============================


    @Query("""
            SELECT COUNT(u)
            FROM User u
            JOIN u.userRoles ur
            JOIN ur.role r
            WHERE r.roleName = 'ADMIN'
           """)
    Long countAdmins();



    @Query("""
            SELECT COUNT(u)
            FROM User u
            JOIN u.userRoles ur
            JOIN ur.role r
            WHERE r.roleName = 'RESEARCHER'
           """)
    Long countResearchers();



    @Query("""
            SELECT COUNT(u)
            FROM User u
            JOIN u.userRoles ur
            JOIN ur.role r
            WHERE r.roleName = 'FOREST_OFFICER'
           """)
    Long countForestOfficers();



    @Query("""
            SELECT COUNT(u)
            FROM User u
            JOIN u.userRoles ur
            JOIN ur.role r
            WHERE r.roleName = 'VOLUNTEER'
           """)
    Long countVolunteers();


}