use rdkafka::producer::{FutureProducer, FutureRecord};
use rdkafka::ClientConfig;
use std::time::Duration;

pub fn create_producer(brokers: &str) -> FutureProducer {
    ClientConfig::new()
        .set("bootstrap.servers", brokers)
        .create()
        .expect("Producer creation error")
}

pub async fn publish_event(producer: &FutureProducer, topic: &str, key: &str, payload: &str) {
    let _ = producer
        .send(
            FutureRecord::to(topic).payload(payload).key(key),
            Duration::from_secs(0),
        )
        .await;
}
