package com.approvalworkflow.config;

import com.approvalworkflow.model.User;
import com.approvalworkflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Seeding default users...");

            userRepository.save(User.builder()
                    .name("Admin User").email("admin@workflow.com")
                    .password(passwordEncoder.encode("password123"))
                    .role("ADMIN").department("IT").build());

            userRepository.save(User.builder()
                    .name("HR Manager").email("hr@workflow.com")
                    .password(passwordEncoder.encode("password123"))
                    .role("HR").department("Human Resources").build());

            userRepository.save(User.builder()
                    .name("Team Manager").email("manager@workflow.com")
                    .password(passwordEncoder.encode("password123"))
                    .role("MANAGER").department("Engineering").build());

            userRepository.save(User.builder()
                    .name("Director").email("director@workflow.com")
                    .password(passwordEncoder.encode("password123"))
                    .role("DIRECTOR").department("Leadership").build());

            userRepository.save(User.builder()
                    .name("John Employee").email("john@workflow.com")
                    .password(passwordEncoder.encode("password123"))
                    .role("EMPLOYEE").department("Engineering").build());

            log.info("Default users seeded successfully.");
        }
    }
}