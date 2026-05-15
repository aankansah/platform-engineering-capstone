use rdkafka::consumer::StreamConsumer;
use rdkafka::message::Message;
use rdkafka::ClientConfig;
use futures_util::StreamExt;
use crate::models::TaskMessage;
use crate::services::enrichment::enrich_task;
use crate::kafka::producer::publish_event;
use rdkafka::producer::FutureProducer;
use tracing::info;

pub async fn start_consumer(brokers: &str, group_id: &str, producer: FutureProducer) {
    let consumer: StreamConsumer = ClientConfig::new()
        .set("bootstrap.servers", brokers)
        .set("group.id", group_id)
        .set("enable.partition.eof", "false")
        .create()
        .expect("Failed to create consumer");

    consumer
        .subscribe(&["tasks"])
        .expect("Failed to subscribe to topics");

    let mut stream = consumer.stream();

    while let Some(message) = stream.next().await {
        match message {
            Ok(m) => {
                if let Some(payload) = m.payload_view::<str>().ok().flatten() {
                    match serde_json::from_str::<TaskMessage>(payload) {
                        Ok(task) => {
                            info!("Consumed task {}", task.taskId);
                            let event = enrich_task(&task);
                            if let Ok(serialized) = serde_json::to_string(&event) {
                                publish_event(&producer, "task-events", &event.taskId, &serialized).await;
                                info!("Published enriched event for {}", event.taskId);
                            }
                        }
                        Err(e) => tracing::error!("Failed to parse task message: {}", e),
                    }
                }
            }
            Err(e) => tracing::error!("Kafka error: {}", e),
        }
    }
}
