package com.polyglottaskpipeline.task_validator.model;

public class TaskMessage {
    private String taskId;
    private String name;
    private String priority;
    private String description;

    public TaskMessage() {}

    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
