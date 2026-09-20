package com.approvalworkflow.controller;
import com.approvalworkflow.dto.*;
import com.approvalworkflow.model.User;
import com.approvalworkflow.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/templates") @RequiredArgsConstructor
@Tag(name = "Workflow Templates", description = "Create and manage workflow types")
@SecurityRequirement(name = "Bearer Auth")
public class WorkflowTemplateController {
    private final WorkflowTemplateService templateService;
    private final AuthService authService;

    @PostMapping
    @Operation(summary = "Create template", description = "Define a new workflow type with ordered approval steps. Requires ADMIN or MANAGER role.")
    public ResponseEntity<ApiResponse<TemplateResponse>> create(
            @Valid @RequestBody CreateTemplateRequest req, Authentication auth) {
        User user = authService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Template created", templateService.createTemplate(req, user)));
    }

    @GetMapping
    @Operation(summary = "List all active templates")
    public ResponseEntity<ApiResponse<List<TemplateResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("OK", templateService.getAllActive()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get template by ID")
    public ResponseEntity<ApiResponse<TemplateResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("OK", templateService.getById(id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate template", description = "Soft-deletes a template. Existing requests are not affected.")
    public ResponseEntity<ApiResponse<TemplateResponse>> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Template deactivated", templateService.deactivate(id)));
    }
}
