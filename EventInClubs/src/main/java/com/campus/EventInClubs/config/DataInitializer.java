package com.campus.EventInClubs.config;

import com.campus.EventInClubs.domain.model.Role;
import com.campus.EventInClubs.domain.model.User;
import com.campus.EventInClubs.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner seedSuperAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String email = "superadmin@eventinclubs.com";
            String rawPassword = "SuperAdmin@2024";

            userRepository.findByEmail(email).ifPresentOrElse(
                    existing -> {},
                    () -> {
                        User superAdmin = User.builder()
                                .name("Super Admin")
                                .email(email)
                                .passwordHash(passwordEncoder.encode(rawPassword))
                                .role(Role.SUPER_ADMIN)
                                .createdAt(Instant.now())
                                .updatedAt(Instant.now())
                                .build();
                        userRepository.save(superAdmin);
                    }
            );
        };
    }
}



