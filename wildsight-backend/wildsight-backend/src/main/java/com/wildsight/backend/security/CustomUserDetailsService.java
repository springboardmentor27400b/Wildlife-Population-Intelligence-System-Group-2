package com.wildsight.backend.security;

import com.wildsight.backend.entity.Role;
import com.wildsight.backend.entity.User;
import com.wildsight.backend.entity.UserRole;
import com.wildsight.backend.repository.UserRepository;
import com.wildsight.backend.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        UserRole userRole = userRoleRepository.findByUser(user)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Role not assigned"));

        Role role = userRole.getRole();

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + role.getRoleName())
                )
        );
    }
}