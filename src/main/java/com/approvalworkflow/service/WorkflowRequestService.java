package com.approvalworkflow.service;

import com.approvalworkflow.dto.*;
import com.approvalworkflow.exception.*;
import com.approvalworkflow.model.*;
import com.approvalworkflow.model.ApprovalStep.StepStatus;
import com.approvalworkflow.model.WorkflowRequest.RequestStatus;
import com.approvalworkflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Core workflow state machine.
 *
 * State transitions:
 * PENDING → IN_PROGRESS (when first step activates)
 * IN_PROGRESS → IN_PROGRESS (step approved, next step activates)
 * IN_PROGRESS → APPROVED (last step approved)
 * IN_PROGRESS → REJECTED (any step rejected)
 * PENDING/IN_PROGRESS → CANCELLED (submitter cancels)
 *
 * This is the class to explain in interviews.
 */
@Service @RequiredArgsConstructor @Slf4j
public class WorkflowRequestService {

    private final WorkflowRequestRepository requestRepository;
    private final WorkflowTemplateRepository templateRepository;
    private final ApprovalStepRepository stepRepository;
    private final UserRepository userRepository;

    // ── Submit ─────────────────────────────────────────────

    @Transactional
    public WorkflowRequestResponse submit(SubmitRequestDto dto, User submittedBy) {
        WorkflowTemplate template = templateRepository.findById(dto.getTemplateId())
            .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + dto.getTemplateId()));

        if (!template.isActive())
            throw new WorkflowException("Template is not active: " + template.getName());

        if (template.getSteps() == null || template.getSteps().isEmpty())
            throw new WorkflowException("Template has no steps defined");

        // Create the request
        WorkflowRequest request = WorkflowRequest.builder()
            .template(template)
            .submittedBy(submittedBy)
            .title(dto.getTitle())
            .description(dto.getDescription())
            .status(RequestStatus.IN_PROGRESS)
            .currentStep(1)
            .approvalSteps(new ArrayList<>())
            .build();

        // Create one ApprovalStep per template step
        // Step 1 = PENDING (active), rest = WAITING
        for (TemplateStep ts : template.getSteps()) {
            // Auto-assign: find a user with the required role
            User assignee = findApproverByRole(ts.getApproverRole());

            ApprovalStep step = ApprovalStep.builder()
                .request(request)
                .stepOrder(ts.getStepOrder())
                .stepName(ts.getStepName())
                .approverRole(ts.getApproverRole())
                .assignedTo(assignee)
                .status(ts.getStepOrder() == 1 ? StepStatus.PENDING : StepStatus.WAITING)
                .build();

            request.getApprovalSteps().add(step);
        }

        WorkflowRequest saved = requestRepository.save(request);
        log.info("Request submitted: id={} template={} by={}",
            saved.getId(), template.getName(), submittedBy.getName());

        return WorkflowRequestResponse.from(saved);
    }

    // ── Approve ────────────────────────────────────────────

    @Transactional
    public WorkflowRequestResponse approve(Long requestId, String comment, User approver) {
        WorkflowRequest request = getActiveRequest(requestId);
        ApprovalStep currentStep = getCurrentPendingStep(request);

        validateApproverCanAct(currentStep, approver);

        // Mark this step as APPROVED
        currentStep.setStatus(StepStatus.APPROVED);
        currentStep.setComment(comment);
        currentStep.setActedAt(LocalDateTime.now());
        stepRepository.save(currentStep);

        log.info("Step {} approved for request {} by {}", currentStep.getStepOrder(), requestId, approver.getName());

        // Check if there's a next step
        int nextStepOrder = currentStep.getStepOrder() + 1;
        boolean hasNextStep = request.getApprovalSteps().stream()
            .anyMatch(s -> s.getStepOrder() == nextStepOrder);

        if (hasNextStep) {
            // Activate next step
            ApprovalStep nextStep = request.getApprovalSteps().stream()
                .filter(s -> s.getStepOrder() == nextStepOrder)
                .findFirst().orElseThrow();
            nextStep.setStatus(StepStatus.PENDING);
            stepRepository.save(nextStep);
            request.setCurrentStep(nextStepOrder);
            log.info("Request {} moved to step {}", requestId, nextStepOrder);
        } else {
            // All steps done — APPROVED
            request.setStatus(RequestStatus.APPROVED);
            log.info("Request {} FULLY APPROVED after {} steps", requestId, currentStep.getStepOrder());
        }

        return WorkflowRequestResponse.from(requestRepository.save(request));
    }

    // ── Reject ─────────────────────────────────────────────

    @Transactional
    public WorkflowRequestResponse reject(Long requestId, String comment, User approver) {
        WorkflowRequest request = getActiveRequest(requestId);
        ApprovalStep currentStep = getCurrentPendingStep(request);

        validateApproverCanAct(currentStep, approver);

        // Mark this step REJECTED
        currentStep.setStatus(StepStatus.REJECTED);
        currentStep.setComment(comment);
        currentStep.setActedAt(LocalDateTime.now());
        stepRepository.save(currentStep);

        // Mark all WAITING steps as SKIPPED
        request.getApprovalSteps().stream()
            .filter(s -> s.getStatus() == StepStatus.WAITING)
            .forEach(s -> {
                s.setStatus(StepStatus.SKIPPED);
                stepRepository.save(s);
            });

        // Reject the whole request
        request.setStatus(RequestStatus.REJECTED);
        log.info("Request {} REJECTED at step {} by {}", requestId, currentStep.getStepOrder(), approver.getName());

        return WorkflowRequestResponse.from(requestRepository.save(request));
    }

    // ── Cancel ─────────────────────────────────────────────

    @Transactional
    public WorkflowRequestResponse cancel(Long requestId, User user) {
        WorkflowRequest request = requestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Request not found: " + requestId));

        if (!request.getSubmittedBy().getId().equals(user.getId()))
            throw new WorkflowException("Only the submitter can cancel a request");

        if (request.getStatus() == RequestStatus.APPROVED || request.getStatus() == RequestStatus.REJECTED)
            throw new WorkflowException("Cannot cancel a request that is already " + request.getStatus());

        request.setStatus(RequestStatus.CANCELLED);
        return WorkflowRequestResponse.from(requestRepository.save(request));
    }

    // ── Queries ────────────────────────────────────────────

    public WorkflowRequestResponse getById(Long id) {
        return WorkflowRequestResponse.from(requestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Request not found: " + id)));
    }

    public List<WorkflowRequestResponse> getMyRequests(Long userId) {
        return requestRepository.findBySubmittedById(userId)
            .stream().map(WorkflowRequestResponse::from).toList();
    }

    public List<WorkflowRequestResponse> getPendingMyApproval(Long userId) {
        return requestRepository.findPendingApprovalForUser(userId)
            .stream().map(WorkflowRequestResponse::from).toList();
    }

    public List<WorkflowRequestResponse> getAll() {
        return requestRepository.findAll()
            .stream().map(WorkflowRequestResponse::from).toList();
    }

    public AnalyticsResponse getAnalytics() {
        long total     = requestRepository.count();
        long pending   = requestRepository.countByStatus(RequestStatus.PENDING);
        long inProgress= requestRepository.countByStatus(RequestStatus.IN_PROGRESS);
        long approved  = requestRepository.countByStatus(RequestStatus.APPROVED);
        long rejected  = requestRepository.countByStatus(RequestStatus.REJECTED);
        long cancelled = requestRepository.countByStatus(RequestStatus.CANCELLED);
        long pendingSteps = stepRepository.countByStatus(StepStatus.PENDING);
        Double avgTime = requestRepository.avgApprovalTimeHours();

        double approvalRate  = total > 0 ? Math.round(approved  * 100.0 / total * 100) / 100.0 : 0;
        double rejectionRate = total > 0 ? Math.round(rejected  * 100.0 / total * 100) / 100.0 : 0;

        return AnalyticsResponse.builder()
            .totalRequests(total).pending(pending).inProgress(inProgress)
            .approved(approved).rejected(rejected).cancelled(cancelled)
            .approvalRate(approvalRate).rejectionRate(rejectionRate)
            .avgApprovalTimeHours(avgTime != null ? Math.round(avgTime * 100.0) / 100.0 : 0)
            .pendingApprovalSteps(pendingSteps)
            .build();
    }

    // ── Helpers ────────────────────────────────────────────

    private WorkflowRequest getActiveRequest(Long id) {
        WorkflowRequest r = requestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Request not found: " + id));
        if (r.getStatus() != RequestStatus.IN_PROGRESS && r.getStatus() != RequestStatus.PENDING)
            throw new WorkflowException("Request is not active. Current status: " + r.getStatus());
        return r;
    }

    private ApprovalStep getCurrentPendingStep(WorkflowRequest request) {
        return request.getApprovalSteps().stream()
            .filter(s -> s.getStatus() == StepStatus.PENDING)
            .findFirst()
            .orElseThrow(() -> new WorkflowException("No pending step found for this request"));
    }

    private void validateApproverCanAct(ApprovalStep step, User approver) {
        // Check: approver has the right role OR is specifically assigned
        boolean hasRole = approver.getRole().equalsIgnoreCase(step.getApproverRole())
                       || approver.getRole().equalsIgnoreCase("ADMIN");
        if (!hasRole)
            throw new WorkflowException("You don't have permission to act on this step. " +
                "Required role: " + step.getApproverRole() + ", your role: " + approver.getRole());
    }

    private User findApproverByRole(String role) {
        List<User> approvers = userRepository.findByRole(role.toUpperCase());
        return approvers.isEmpty() ? null : approvers.get(0);
    }
}
