package com.approvalworkflow.dto;
import com.approvalworkflow.model.WorkflowTemplate;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Data @Builder
public class TemplateResponse {
    private Long id;
    private String name;
    private String description;
    private boolean active;
    private List<StepResponse> steps;
    private LocalDateTime createdAt;
    @Data @Builder
    public static class StepResponse {
        private Long id;
        private int stepOrder;
        private String stepName;
        private String approverRole;
        private String description;
    }
    public static TemplateResponse from(WorkflowTemplate t) {
        return TemplateResponse.builder()
            .id(t.getId()).name(t.getName()).description(t.getDescription())
            .active(t.isActive()).createdAt(t.getCreatedAt())
            .steps(t.getSteps() == null ? List.of() : t.getSteps().stream().map(s ->
                StepResponse.builder().id(s.getId()).stepOrder(s.getStepOrder())
                    .stepName(s.getStepName()).approverRole(s.getApproverRole())
                    .description(s.getDescription()).build()).toList())
            .build();
    }
}
