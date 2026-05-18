package com.polyglottaskpipeline.task_validator.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polyglottaskpipeline.task_validator.model.EventMessage;
import com.polyglottaskpipeline.task_validator.model.TaskMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class TaskProcessor {
    private static final Logger log = LoggerFactory.getLogger(TaskProcessor.class);
    private static final String SERVICE_NAME = "task-validator";
    private static final Set<String> ALLOWED_PRIORITIES = Set.of("low", "medium", "high");

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper mapper = new ObjectMapper();
    private final String outputTopic;

    public TaskProcessor(KafkaTemplate<String, String> kafkaTemplate,
                         @Value("${application.topics.events:task-events}") String outputTopic) {
        this.kafkaTemplate = kafkaTemplate;
        this.outputTopic = outputTopic;
    }

    @KafkaListener(
            topics = "${application.topics.tasks:tasks}",
            groupId = "${spring.kafka.consumer.group-id:task-validator-group}"
    )
    public void handleTask(String payload) {
        try {
            TaskMessage task = mapper.readValue(payload, TaskMessage.class);
            log.info("Received task: {}", task.getTaskId());

            EventMessage event = validate(task);
            String taskKey = hasText(event.getTaskId()) ? event.getTaskId() : "unknown-task";

            String out = mapper.writeValueAsString(event);
            kafkaTemplate.send(outputTopic, taskKey, out);
            log.info("Published {} event for task {} to topic {}", event.getStatus(), taskKey, outputTopic);
        } catch (Exception e) {
            log.error("Failed to process task payload", e);
        }
    }

    EventMessage validate(TaskMessage task) {
        List<String> errors = new ArrayList<>();

        if (!hasText(task.getTaskId())) {
            errors.add("taskId is required");
        }
        if (!hasText(task.getName())) {
            errors.add("name is required");
        }
        if (!hasText(task.getDescription())) {
            errors.add("description is required");
        }
        if (!hasText(task.getPriority())) {
            errors.add("priority is required");
        } else if (!ALLOWED_PRIORITIES.contains(task.getPriority().toLowerCase())) {
            errors.add("priority must be one of low, medium, high");
        }

        boolean valid = errors.isEmpty();
        String status = valid ? "VALIDATED" : "VALIDATION_FAILED";
        String message = valid
                ? "Task Validator validated task"
                : "Task Validator rejected task: " + String.join("; ", errors);

        return new EventMessage(
                task.getTaskId(),
                SERVICE_NAME,
                status,
                message,
                Instant.now().toString(),
                task.getName(),
                task.getName(),
                task.getDescription(),
                task.getPriority(),
                valid,
                errors
        );
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
