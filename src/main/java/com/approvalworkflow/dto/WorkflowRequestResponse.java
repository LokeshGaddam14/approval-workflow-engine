package com.approvalworkflow.dto;
import com.approvalworkflow.model.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Data @Builder
public class WorkflowRequestResponse {
    private Long id;
    private String templateName;
    private String submittedByName;
    private String title;
    private String description;
    private String status;
    private int currentStep;
    private int totalSteps;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<StepDetail> steps;
    @Data @Builder
    public static class StepDetail {
        private Long id;
        private int stepOrder;
        private String stepName;
        private String approverRole;
        private String assignedToName;
        private String status;
        private String comment;
        private LocalDateTime actedAt;
    }
    public static WorkflowRequestResponse from(WorkflowRequest r) {
        return WorkflowRequestResponse.builder()
            .id(r.getId())
            .templateName(r.getTemplate().getName())
            .submittedByName(r.getSubmittedBy().getName())
            .title(r.getTitle())
            .description(r.getDescription())
            .status(r.getStatus().name())
            .currentStep(r.getCurrentStep())
            .totalSteps(r.getTemplate().getSteps() != null ? r.getTemplate().getSteps().size() : 0)
            .createdAt(r.getCreatedAt())
            .updatedAt(r.getUpdatedAt())
            .steps(r.getApprovalSteps() == null ? List.of() : r.getApprovalSteps().stream().map(s ->
                StepDetail.builder()
                    .id(s.getId()).stepOrder(s.getStepOrder()).stepName(s.getStepName())
                    .approverRole(s.getApproverRole())
                    .assignedToName(s.getAssignedTo() != null ? s.getAssignedTo().getName() : null)
                    .status(s.getStatus().name()).comment(s.getComment()).actedAt(s.getActedAt())
                    .build()).toList())
            .build();
    }
}
