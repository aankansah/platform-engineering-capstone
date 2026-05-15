package com.polyglottaskpipeline.task_validator;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;

import java.time.Duration;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}")
@EmbeddedKafka(partitions = 1, topics = {"tasks", "task-events"})
public class TaskProcessorTest {

    @Autowired
    private EmbeddedKafkaBroker embeddedKafkaBroker;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    private org.apache.kafka.clients.consumer.Consumer<String, String> consumer;

    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        var consumerProps = KafkaTestUtils.consumerProps("testGroup", "true", embeddedKafkaBroker);
        var cf = new DefaultKafkaConsumerFactory<>(consumerProps);
        consumer = cf.createConsumer();
        consumer.subscribe(java.util.List.of("task-events"));
    }

    @AfterEach
    void tearDown() {
        if (consumer != null) consumer.close();
    }

    @Test
    void whenTaskPublished_thenValidatorEmitsEvent() throws Exception {
        var task = Map.of(
                "taskId", "task-123",
                "name", "Process Customer Data",
                "priority", "high",
                "description", "Validate this task"
        );

        String payload = mapper.writeValueAsString(task);
        kafkaTemplate.send(new ProducerRecord<>("tasks", "task-123", payload));

        var single = getEventForTask("task-123");
        assertThat(single).isNotNull();

        @SuppressWarnings("unchecked")
        Map<String, Object> event = mapper.readValue(single.value(), Map.class);
        assertThat(event)
                .containsEntry("taskId", "task-123")
                .containsEntry("service", "task-validator")
                .containsEntry("status", "VALIDATED")
                .containsEntry("message", "Task Validator validated task")
                .containsEntry("priority", "high")
                .containsEntry("valid", true);
    }

    @Test
    void whenTaskIsInvalid_thenValidatorEmitsFailureEvent() throws Exception {
        var task = Map.of(
                "taskId", "task-456",
                "name", "Incomplete Task",
                "priority", "urgent"
        );

        String payload = mapper.writeValueAsString(task);
        kafkaTemplate.send(new ProducerRecord<>("tasks", "task-456", payload));

        var single = getEventForTask("task-456");
        assertThat(single).isNotNull();

        @SuppressWarnings("unchecked")
        Map<String, Object> event = mapper.readValue(single.value(), Map.class);
        assertThat(event)
                .containsEntry("taskId", "task-456")
                .containsEntry("service", "task-validator")
                .containsEntry("status", "VALIDATION_FAILED")
                .containsEntry("valid", false);
        assertThat((String) event.get("message")).contains("Task Validator rejected task");
        assertThat((java.util.List<String>) event.get("validationErrors"))
                .contains("description is required", "priority must be one of low, medium, high");
    }

    private ConsumerRecord<String, String> getEventForTask(String taskId) throws Exception {
        long deadline = System.currentTimeMillis() + 10_000;

        while (System.currentTimeMillis() < deadline) {
            var records = KafkaTestUtils.getRecords(consumer, Duration.ofMillis(500));
            for (ConsumerRecord<String, String> record : records.records("task-events")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> event = mapper.readValue(record.value(), Map.class);
                if (taskId.equals(event.get("taskId"))) {
                    return record;
                }
            }
        }

        throw new AssertionError("No validation event found for task " + taskId);
    }
}
