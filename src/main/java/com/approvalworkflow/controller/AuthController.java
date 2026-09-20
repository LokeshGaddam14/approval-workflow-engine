package com.approvalworkflow.controller;
import com.approvalworkflow.dto.*;
import com.approvalworkflow.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register and login")
public class AuthController {
    private final AuthService authService;
    @PostMapping("/register")
    @Operation(summary = "Register", description = "Register a new EMPLOYEE account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Registered successfully", authService.register(req)));
    }
    @PostMapping("/login")
    @Operation(summary = "Login", description = "Login to get JWT token. Default users: admin@workflow.com, hr@workflow.com, manager@workflow.com, director@workflow.com, john@workflow.com — all password: password123")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", authService.login(req)));
    }
}
