package com.polyglottaskpipeline.task_validator.model;

import java.util.List;

public class EventMessage {
    private String taskId;
    private String service;
    private String status;
    private String message;
    private String timestamp;
    private String priority;
    private boolean valid;
    private List<String> validationErrors;

    public EventMessage() {}

    public EventMessage(String taskId,
                        String service,
                        String status,
                        String message,
                        String timestamp,
                        String priority,
                        boolean valid,
                        List<String> validationErrors) {
        this.taskId = taskId;
        this.service = service;
        this.status = status;
        this.message = message;
        this.timestamp = timestamp;
        this.priority = priority;
        this.valid = valid;
        this.validationErrors = validationErrors;
    }

    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public List<String> getValidationErrors() { return validationErrors; }
    public void setValidationErrors(List<String> validationErrors) { this.validationErrors = validationErrors; }
}
