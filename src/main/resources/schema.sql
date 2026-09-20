CREATE DATABASE IF NOT EXISTS approval_workflow;
USE approval_workflow;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(50)  NOT NULL DEFAULT 'EMPLOYEE',
    department  VARCHAR(100),
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Workflow templates (e.g. "Leave Request", "Purchase Order")
CREATE TABLE IF NOT EXISTS workflow_templates (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_by  BIGINT,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Steps inside each template (ordered)
CREATE TABLE IF NOT EXISTS template_steps (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_id    BIGINT NOT NULL,
    step_order     INT NOT NULL,
    step_name      VARCHAR(100) NOT NULL,
    approver_role  VARCHAR(50) NOT NULL,
    description    TEXT,
    FOREIGN KEY (template_id) REFERENCES workflow_templates(id) ON DELETE CASCADE,
    UNIQUE KEY unique_step_order (template_id, step_order)
);

-- Actual workflow requests submitted by users
CREATE TABLE IF NOT EXISTS workflow_requests (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_id  BIGINT NOT NULL,
    submitted_by BIGINT NOT NULL,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    status       ENUM('PENDING','IN_PROGRESS','APPROVED','REJECTED','CANCELLED')
                 NOT NULL DEFAULT 'PENDING',
    current_step INT NOT NULL DEFAULT 1,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id)  REFERENCES workflow_templates(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_submitted_by (submitted_by)
);

-- Individual approval steps for each request
CREATE TABLE IF NOT EXISTS approval_steps (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id     BIGINT NOT NULL,
    step_order     INT NOT NULL,
    step_name      VARCHAR(100) NOT NULL,
    approver_role  VARCHAR(50) NOT NULL,
    assigned_to    BIGINT,
    status         ENUM('WAITING','PENDING','APPROVED','REJECTED','SKIPPED')
                   NOT NULL DEFAULT 'WAITING',
    comment        TEXT,
    acted_at       DATETIME,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id)  REFERENCES workflow_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_request_id (request_id),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_status (status)
);

-- Seed default users
-- Password for all: password123 (BCrypt)
INSERT IGNORE INTO users (name, email, password, role, department) VALUES
('Admin User',    'admin@workflow.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', 'ADMIN',    'IT'),
('HR Manager',    'hr@workflow.com',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', 'HR',       'Human Resources'),
('Team Manager',  'manager@workflow.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', 'MANAGER',  'Engineering'),
('Director',      'director@workflow.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', 'DIRECTOR', 'Leadership'),
('John Employee', 'john@workflow.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', 'EMPLOYEE', 'Engineering');
