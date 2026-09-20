package com.approvalworkflow.service;

import com.approvalworkflow.dto.SubmitRequestDto;
import com.approvalworkflow.exception.WorkflowException;
import com.approvalworkflow.model.*;
import com.approvalworkflow.model.ApprovalStep.StepStatus;
import com.approvalworkflow.model.WorkflowRequest.RequestStatus;
import com.approvalworkflow.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkflowStateMachineTest {

    @Mock private WorkflowRequestRepository requestRepository;
    @Mock private WorkflowTemplateRepository templateRepository;
    @Mock private ApprovalStepRepository stepRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private WorkflowRequestService service;

    private User employee, manager, hr;
    private WorkflowTemplate template;

    @BeforeEach
    void setUp() {
        employee = User.builder().id(1L).name("John").email("john@test.com").role("EMPLOYEE").build();
        manager  = User.builder().id(2L).name("Manager").email("mgr@test.com").role("MANAGER").build();
        hr       = User.builder().id(3L).name("HR").email("hr@test.com").role("HR").build();

        TemplateStep step1 = TemplateStep.builder().id(1L).stepOrder(1).stepName("Manager Approval").approverRole("MANAGER").build();
        TemplateStep step2 = TemplateStep.builder().id(2L).stepOrder(2).stepName("HR Approval").approverRole("HR").build();

        template = WorkflowTemplate.builder().id(1L).name("Leave Request").active(true)
            .steps(List.of(step1, step2)).build();
    }

    @Test
    @DisplayName("Approving last step marks request as APPROVED")
    void approvingLastStepFullyApprovesRequest() {
        ApprovalStep step1 = ApprovalStep.builder().id(1L).stepOrder(1).approverRole("MANAGER")
            .status(StepStatus.APPROVED).build();
        ApprovalStep step2 = ApprovalStep.builder().id(2L).stepOrder(2).approverRole("HR")
            .status(StepStatus.PENDING).assignedTo(hr).build();

        WorkflowRequest request = WorkflowRequest.builder().id(1L).template(template)
            .status(RequestStatus.IN_PROGRESS).currentStep(2)
            .approvalSteps(new ArrayList<>(List.of(step1, step2))).build();

        when(requestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(stepRepository.save(any())).thenReturn(step2);
        when(requestRepository.save(any())).thenReturn(request);

        service.approve(1L, "Approved by HR", hr);

        assertEquals(RequestStatus.APPROVED, request.getStatus());
        assertEquals(StepStatus.APPROVED, step2.getStatus());
    }

    @Test
    @DisplayName("Rejecting a step marks entire request as REJECTED and skips remaining steps")
    void rejectingStepRejectsRequestAndSkipsRemainingSteps() {
        ApprovalStep step1 = ApprovalStep.builder().id(1L).stepOrder(1).approverRole("MANAGER")
            .status(StepStatus.PENDING).assignedTo(manager).build();
        ApprovalStep step2 = ApprovalStep.builder().id(2L).stepOrder(2).approverRole("HR")
            .status(StepStatus.WAITING).build();

        WorkflowRequest request = WorkflowRequest.builder().id(1L).template(template)
            .status(RequestStatus.IN_PROGRESS).currentStep(1)
            .approvalSteps(new ArrayList<>(List.of(step1, step2))).build();

        when(requestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(stepRepository.save(any())).thenReturn(step1);
        when(requestRepository.save(any())).thenReturn(request);

        service.reject(1L, "Rejected — insufficient leave balance", manager);

        assertEquals(RequestStatus.REJECTED, request.getStatus());
        assertEquals(StepStatus.REJECTED, step1.getStatus());
        assertEquals(StepStatus.SKIPPED, step2.getStatus());
    }

    @Test
    @DisplayName("Wrong role cannot approve a step")
    void wrongRoleCannotApprove() {
        ApprovalStep step = ApprovalStep.builder().id(1L).stepOrder(1).approverRole("MANAGER")
            .status(StepStatus.PENDING).build();

        WorkflowRequest request = WorkflowRequest.builder().id(1L).template(template)
            .status(RequestStatus.IN_PROGRESS).currentStep(1)
            .approvalSteps(new ArrayList<>(List.of(step))).build();

        when(requestRepository.findById(1L)).thenReturn(Optional.of(request));

        assertThrows(WorkflowException.class, () -> service.approve(1L, "Trying to approve", employee));
    }

    @Test
    @DisplayName("Approving mid-step activates next step")
    void approvingMidStepActivatesNextStep() {
        ApprovalStep step1 = ApprovalStep.builder().id(1L).stepOrder(1).approverRole("MANAGER")
            .status(StepStatus.PENDING).assignedTo(manager).build();
        ApprovalStep step2 = ApprovalStep.builder().id(2L).stepOrder(2).approverRole("HR")
            .status(StepStatus.WAITING).build();

        WorkflowRequest request = WorkflowRequest.builder().id(1L).template(template)
            .status(RequestStatus.IN_PROGRESS).currentStep(1)
            .approvalSteps(new ArrayList<>(List.of(step1, step2))).build();

        when(requestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(stepRepository.save(any())).thenReturn(step1);
        when(requestRepository.save(any())).thenReturn(request);

        service.approve(1L, "Approved", manager);

        assertEquals(StepStatus.PENDING, step2.getStatus());
        assertEquals(RequestStatus.IN_PROGRESS, request.getStatus());
        assertEquals(2, request.getCurrentStep());
    }
}
