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
@RestController @RequestMapping("/api/requests") @RequiredArgsConstructor
@Tag(name = "Workflow Requests", description = "Submit and manage approval requests")
@SecurityRequirement(name = "Bearer Auth")
public class WorkflowRequestController {
    private final WorkflowRequestService requestService;
    private final AuthService authService;

    @PostMapping
    @Operation(summary = "Submit a request", description = "Submit a new approval request using any active template")
    public ResponseEntity<ApiResponse<WorkflowRequestResponse>> submit(
            @Valid @RequestBody SubmitRequestDto dto, Authentication auth) {
        User user = authService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Request submitted", requestService.submit(dto, user)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get request by ID", description = "Full details including all approval steps and their status")
    public ResponseEntity<ApiResponse<WorkflowRequestResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("OK", requestService.getById(id)));
    }

    @GetMapping("/my")
    @Operation(summary = "My submitted requests", description = "All requests submitted by the logged-in user")
    public ResponseEntity<ApiResponse<List<WorkflowRequestResponse>>> myRequests(Authentication auth) {
        User user = authService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("OK", requestService.getMyRequests(user.getId())));
    }

    @GetMapping("/pending-my-approval")
    @Operation(summary = "Requests waiting for my approval", description = "All requests where the logged-in user needs to take action")
    public ResponseEntity<ApiResponse<List<WorkflowRequestResponse>>> pendingMyApproval(Authentication auth) {
        User user = authService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("OK", requestService.getPendingMyApproval(user.getId())));
    }

    @GetMapping
    @Operation(summary = "[ADMIN] All requests", description = "View all requests across all users. Requires ADMIN role.")
    public ResponseEntity<ApiResponse<List<WorkflowRequestResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("OK", requestService.getAll()));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve current step", description = "Approve the current pending step. If last step, request is FULLY APPROVED.")
    public ResponseEntity<ApiResponse<WorkflowRequestResponse>> approve(
            @PathVariable Long id, @RequestBody(required = false) ActionRequest req, Authentication auth) {
        User user = authService.getUserByEmail(auth.getName());
        String comment = req != null ? req.getComment() : null;
        return ResponseEntity.ok(ApiResponse.success("Step approved", requestService.approve(id, comment, user)));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject current step", description = "Reject the request. All remaining steps are skipped and request is REJECTED.")
    public ResponseEntity<ApiResponse<WorkflowRequestResponse>> reject(
            @PathVariable Long id, @RequestBody(required = false) ActionRequest req, Authentication auth) {
        User user = authService.getUserByEmail(auth.getName());
        String comment = req != null ? req.getComment() : null;
        return ResponseEntity.ok(ApiResponse.success("Request rejected", requestService.reject(id, comment, user)));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel request", description = "Cancel a pending/in-progress request. Only the submitter can cancel.")
    public ResponseEntity<ApiResponse<WorkflowRequestResponse>> cancel(
            @PathVariable Long id, Authentication auth) {
        User user = authService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Request cancelled", requestService.cancel(id, user)));
    }

    @GetMapping("/analytics")
    @Operation(summary = "[ADMIN] Analytics dashboard", description = "Approval rates, rejection rates, avg approval time")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> analytics() {
        return ResponseEntity.ok(ApiResponse.success("Analytics", requestService.getAnalytics()));
    }
}
