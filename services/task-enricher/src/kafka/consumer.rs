use crate::kafka::producer::publish_event;
use crate::models::TaskMessage;
use crate::services::enrichment::enrich_task;
use futures_util::StreamExt;
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::message::Message;
use rdkafka::producer::FutureProducer;
use rdkafka::ClientConfig;
use tracing::info;

pub async fn start_consumer(
    brokers: &str,
    group_id: &str,
    tasks_topic: &str,
    events_topic: &str,
    producer: FutureProducer,
) {
    let consumer: StreamConsumer = ClientConfig::new()
        .set("bootstrap.servers", brokers)
        .set("group.id", group_id)
        .set("enable.partition.eof", "false")
        .set("auto.offset.reset", "earliest")
        .create()
        .expect("Failed to create consumer");

    consumer
        .subscribe(&[tasks_topic])
        .expect("Failed to subscribe to topics");

    let mut stream = consumer.stream();

    while let Some(message) = stream.next().await {
        match message {
            Ok(m) => {
                if let Some(Ok(payload)) = m.payload_view::<str>() {
                    match serde_json::from_str::<TaskMessage>(payload) {
                        Ok(task) => {
                            info!("Consumed task {}", task.task_id);
                            let event = enrich_task(&task);
                            if let Ok(serialized) = serde_json::to_string(&event) {
                                publish_event(&producer, events_topic, &event.task_id, &serialized)
                                    .await;
                                info!("Published enriched event for {}", event.task_id);
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
