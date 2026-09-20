# ⚙️ Approval Workflow Engine

> A configurable multi-step approval workflow engine supporting dynamic approver chains, state machine transitions, and full audit history — applicable to HR, procurement, and compliance workflows.

---

## The Problem It Solves

Every enterprise has approval chains — leave requests, purchase orders, loan disbursements, vendor onboarding. They're all hardcoded spaghetti. Someone says "add a new approval step" and the entire codebase breaks.

This engine solves that by making workflows **fully configurable**:
- Define any workflow type (Leave, Purchase, Onboarding) with any number of steps
- Each step has a required approver role — no hardcoding
- Submit a request → it flows through steps automatically
- Any approver can approve or reject their step
- Rejection closes the entire request and skips remaining steps
- Full audit trail — who did what, when, with what comment

---

## Architecture — State Machine

```
Request Submitted
      │
      ▼
Step 1: PENDING ──── Approved ──▶ Step 2: PENDING ──── Approved ──▶ FULLY APPROVED
      │                                   │
    Rejected                           Rejected
      │                                   │
      ▼                                   ▼
REJECTED (all remaining steps = SKIPPED)
```

**Key design:** The state machine lives entirely in `WorkflowRequestService`. One class manages all transitions — no scattered if/else across the codebase.

---

## Tech Stack

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![JWT](https://img.shields.io/badge/Auth-JWT-red)
![Maven](https://img.shields.io/badge/Build-Maven-yellow)

---

## Key Features

- **Configurable templates**: Define workflow types via API — no code changes needed to add a new approval type
- **State machine**: Clean transitions — PENDING → IN_PROGRESS → APPROVED/REJECTED
- **Role-based approvals**: Each step requires a specific role (MANAGER, HR, DIRECTOR, etc.)
- **Auto-assignment**: System finds available approver for each step automatically
- **Cascade rejection**: Reject one step → entire request rejected, remaining steps skipped
- **Full audit trail**: Every approval/rejection logged with timestamp and comment
- **Analytics**: Approval rates, rejection rates, average approval time
- **JWT auth**: Role-based access — employees submit, managers/HR approve, admin sees everything

---

## API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | Login, get JWT |
| POST | `/api/templates` | ADMIN/MANAGER | Create workflow type |
| GET | `/api/templates` | Any | List active templates |
| POST | `/api/requests` | Any | Submit a request |
| GET | `/api/requests/my` | Any | My submitted requests |
| GET | `/api/requests/pending-my-approval` | Any | Requests waiting for me |
| POST | `/api/requests/{id}/approve` | Role-based | Approve current step |
| POST | `/api/requests/{id}/reject` | Role-based | Reject the request |
| POST | `/api/requests/{id}/cancel` | Submitter | Cancel own request |
| GET | `/api/requests/{id}` | Any | Full request + audit trail |
| GET | `/api/requests/analytics` | ADMIN | Dashboard |

---

## Default Users (all password: `password123`)

| Email | Role | Can Do |
|-------|------|--------|
| admin@workflow.com | ADMIN | Everything |
| manager@workflow.com | MANAGER | Create templates, approve manager steps |
| hr@workflow.com | HR | Approve HR steps |
| director@workflow.com | DIRECTOR | Approve director steps |
| john@workflow.com | EMPLOYEE | Submit requests |

---

## How to Run Locally

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/approval-workflow-engine.git
cd approval-workflow-engine

# 2. Setup DB
mysql -u root -p < src/main/resources/schema.sql

# 3. Configure
# Edit src/main/resources/application.properties
# Set spring.datasource.password = your MySQL password

# 4. Run
mvn spring-boot:run

# 5. Open Swagger UI
# http://localhost:8080/swagger-ui.html
```

---

## Example Flow: Leave Request

```
1. Admin creates "Leave Request" template:
   Step 1: Manager Approval (role: MANAGER)
   Step 2: HR Approval (role: HR)

2. John (EMPLOYEE) submits "Annual Leave - 5 days"
   → Step 1 becomes PENDING, assigned to manager

3. Manager logs in → sees request in pending-my-approval
   → Approves with comment "Approved, no conflicts"
   → Step 2 activates automatically

4. HR logs in → sees request in pending-my-approval
   → Approves with comment "Leave balance verified"
   → Request status = FULLY APPROVED ✅

Alternative: HR rejects → Request = REJECTED, remaining steps SKIPPED ❌
```

---

## What I Learned

- How state machines model real-world business processes cleanly
- Why configurable workflows beat hardcoded approval logic
- Role-based authorization at the service layer vs controller layer
- Cascade operations with JPA (approval steps linked to requests)
