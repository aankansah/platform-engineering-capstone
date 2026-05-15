package com.polyglottaskpipeline.task_validator.model;

public class EventMessage {
    private String taskId;
    private String service;
    private String message;

    public EventMessage() {}

    public EventMessage(String taskId, String service, String message) {
        this.taskId = taskId;
        this.service = service;
        this.message = message;
    }

    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
