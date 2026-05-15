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

@Service
public class TaskProcessor {
    private static final Logger log = LoggerFactory.getLogger(TaskProcessor.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper mapper = new ObjectMapper();
    private final String outputTopic;

    public TaskProcessor(KafkaTemplate<String, String> kafkaTemplate,
                         @Value("${application.topics.events:events}") String outputTopic) {
        this.kafkaTemplate = kafkaTemplate;
        this.outputTopic = outputTopic;
    }

    @KafkaListener(topics = "tasks", groupId = "task-validator-group")
    public void handleTask(String payload) {
        try {
            TaskMessage task = mapper.readValue(payload, TaskMessage.class);
            log.info("Received task: {}", task.getTaskId());

            // Basic validation example: ensure taskId present
            String taskId = task.getTaskId();
            String msg = "Java Service validated task";
            EventMessage event = new EventMessage(taskId, "java-service", msg);

            String out = mapper.writeValueAsString(event);
            kafkaTemplate.send(outputTopic, taskId, out);
            log.info("Published event for task {} to topic {}", taskId, outputTopic);
        } catch (Exception e) {
            log.error("Failed to process task payload", e);
        }
    }
}
