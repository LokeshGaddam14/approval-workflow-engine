package com.approvalworkflow.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "template_steps")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TemplateStep {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private WorkflowTemplate template;
    @Column(name = "step_order", nullable = false)
    private int stepOrder;
    @Column(name = "step_name", nullable = false, length = 100)
    private String stepName;
    @Column(name = "approver_role", nullable = false, length = 50)
    private String approverRole;
    @Column(columnDefinition = "TEXT")
    private String description;
}
