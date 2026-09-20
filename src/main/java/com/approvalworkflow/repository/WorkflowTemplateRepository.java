package com.approvalworkflow.repository;

import com.approvalworkflow.model.WorkflowTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkflowTemplateRepository extends JpaRepository<WorkflowTemplate, Long> {
    List<WorkflowTemplate> findByActiveTrue();
    boolean existsByName(String name);
}
