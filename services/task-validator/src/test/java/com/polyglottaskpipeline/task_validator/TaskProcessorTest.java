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
import org.springframework.kafka.test.utils.ContainerTestUtils;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.KafkaMessageListenerContainer;
import org.springframework.kafka.listener.ContainerProperties;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = {"tasks", "events"})
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
        consumer.subscribe(java.util.List.of("events"));
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
                "priority", "high"
        );

        String payload = mapper.writeValueAsString(task);
        kafkaTemplate.send(new ProducerRecord<>("tasks", "task-123", payload));

        // give some time for listener to process
        Thread.sleep(1500);

        var single = KafkaTestUtils.getSingleRecord(consumer, "events");
        assertThat(single).isNotNull();
    }
}
