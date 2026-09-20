package com.approvalworkflow.repository;

import com.approvalworkflow.model.WorkflowRequest;
import com.approvalworkflow.model.WorkflowRequest.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface WorkflowRequestRepository extends JpaRepository<WorkflowRequest, Long> {
    List<WorkflowRequest> findBySubmittedById(Long userId);
    List<WorkflowRequest> findByStatus(RequestStatus status);
    long countByStatus(RequestStatus status);

    @Query("""
        SELECT r FROM WorkflowRequest r
        JOIN r.approvalSteps s
        WHERE s.assignedTo.id = :userId
        AND s.status = 'PENDING'
        """)
    List<WorkflowRequest> findPendingApprovalForUser(@Param("userId") Long userId);

    @Query("""
        SELECT AVG(TIMESTAMPDIFF(HOUR, r.createdAt, r.updatedAt))
        FROM WorkflowRequest r
        WHERE r.status = 'APPROVED'
        """)
    Double avgApprovalTimeHours();
}
