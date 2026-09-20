package com.approvalworkflow.dto;
import lombok.*;
@Data @Builder
public class AnalyticsResponse {
    private long totalRequests;
    private long pending;
    private long inProgress;
    private long approved;
    private long rejected;
    private long cancelled;
    private double approvalRate;
    private double rejectionRate;
    private double avgApprovalTimeHours;
    private long pendingApprovalSteps;
}
