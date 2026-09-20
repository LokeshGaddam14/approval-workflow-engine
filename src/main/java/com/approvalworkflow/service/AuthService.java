package com.approvalworkflow.service;
import com.approvalworkflow.dto.*;
import com.approvalworkflow.model.User;
import com.approvalworkflow.repository.UserRepository;
import com.approvalworkflow.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        User user = User.builder().name(request.getName()).email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role("EMPLOYEE").department(request.getDepartment()).build();
        userRepository.save(user);
        return new AuthResponse(jwtUtil.generateToken(user.getEmail(), user.getRole()),
            user.getEmail(), user.getRole(), user.getName());
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            throw new IllegalArgumentException("Invalid email or password");
        return new AuthResponse(jwtUtil.generateToken(user.getEmail(), user.getRole()),
            user.getEmail(), user.getRole(), user.getName());
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }
}
