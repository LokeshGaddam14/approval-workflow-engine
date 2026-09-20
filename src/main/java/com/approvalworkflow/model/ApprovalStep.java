package com.approvalworkflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "approval_steps")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApprovalStep {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private WorkflowRequest request;
    @Column(name = "step_order", nullable = false)
    private int stepOrder;
    @Column(name = "step_name", nullable = false, length = 100)
    private String stepName;
    @Column(name = "approver_role", nullable = false, length = 50)
    private String approverRole;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StepStatus status = StepStatus.WAITING;
    @Column(columnDefinition = "TEXT")
    private String comment;
    @Column(name = "acted_at")
    private LocalDateTime actedAt;
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }
    public enum StepStatus { WAITING, PENDING, APPROVED, REJECTED, SKIPPED }
}
