package com.approvalworkflow.service;

import com.approvalworkflow.dto.*;
import com.approvalworkflow.exception.ResourceNotFoundException;
import com.approvalworkflow.model.*;
import com.approvalworkflow.repository.WorkflowTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service @RequiredArgsConstructor @Slf4j
public class WorkflowTemplateService {

    private final WorkflowTemplateRepository templateRepository;

    @Transactional
    public TemplateResponse createTemplate(CreateTemplateRequest request, User createdBy) {
        if (templateRepository.existsByName(request.getName()))
            throw new IllegalArgumentException("Template already exists: " + request.getName());

        WorkflowTemplate template = WorkflowTemplate.builder()
            .name(request.getName())
            .description(request.getDescription())
            .createdBy(createdBy)
            .steps(new ArrayList<>())
            .build();

        // Build ordered steps from request
        List<CreateTemplateRequest.StepRequest> stepRequests = request.getSteps();
        for (int i = 0; i < stepRequests.size(); i++) {
            CreateTemplateRequest.StepRequest sr = stepRequests.get(i);
            TemplateStep step = TemplateStep.builder()
                .template(template)
                .stepOrder(i + 1)
                .stepName(sr.getStepName())
                .approverRole(sr.getApproverRole())
                .description(sr.getDescription())
                .build();
            template.getSteps().add(step);
        }

        WorkflowTemplate saved = templateRepository.save(template);
        log.info("Template created: {} with {} steps", saved.getName(), saved.getSteps().size());
        return TemplateResponse.from(saved);
    }

    public List<TemplateResponse> getAllActive() {
        return templateRepository.findByActiveTrue()
            .stream().map(TemplateResponse::from).toList();
    }

    public List<TemplateResponse> getAll() {
        return templateRepository.findAll()
            .stream().map(TemplateResponse::from).toList();
    }

    public TemplateResponse getById(Long id) {
        WorkflowTemplate t = templateRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + id));
        return TemplateResponse.from(t);
    }

    @Transactional
    public TemplateResponse deactivate(Long id) {
        WorkflowTemplate t = templateRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + id));
        t.setActive(false);
        return TemplateResponse.from(templateRepository.save(t));
    }

    @Transactional
    public TemplateResponse activate(Long id) {
        WorkflowTemplate t = templateRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + id));
        t.setActive(true);
        return TemplateResponse.from(templateRepository.save(t));
    }
}
