package com.approvalworkflow.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
@Data
public class SubmitRequestDto {
    @NotNull private Long templateId;
    @NotBlank private String title;
    private String description;
}
