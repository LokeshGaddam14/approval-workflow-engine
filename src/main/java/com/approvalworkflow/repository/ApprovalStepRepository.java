package com.approvalworkflow.repository;

import com.approvalworkflow.model.ApprovalStep;
import com.approvalworkflow.model.ApprovalStep.StepStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApprovalStepRepository extends JpaRepository<ApprovalStep, Long> {
    List<ApprovalStep> findByRequestIdOrderByStepOrderAsc(Long requestId);
    Optional<ApprovalStep> findByRequestIdAndStepOrder(Long requestId, int stepOrder);
    List<ApprovalStep> findByAssignedToIdAndStatus(Long userId, StepStatus status);
    long countByStatus(StepStatus status);
}
