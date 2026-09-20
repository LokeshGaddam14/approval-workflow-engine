package com.approvalworkflow.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;
@Data
public class CreateTemplateRequest {
    @NotBlank private String name;
    private String description;
    @NotEmpty private List<StepRequest> steps;
    @Data
    public static class StepRequest {
        @NotBlank private String stepName;
        @NotBlank private String approverRole;
        private String description;
    }
}
