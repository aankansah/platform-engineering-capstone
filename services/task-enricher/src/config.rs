use std::env;

pub struct Settings {
    pub kafka_brokers: String,
    pub consumer_group: String,
    pub listen_addr: String,
    pub tasks_topic: String,
    pub events_topic: String,
}

impl Settings {
    pub fn from_env() -> Self {
        Self {
            kafka_brokers: env::var("KAFKA_BROKERS").unwrap_or_else(|_| "localhost:9092".into()),
            consumer_group: env::var("CONSUMER_GROUP")
                .unwrap_or_else(|_| "task-enricher-group".into()),
            listen_addr: env::var("LISTEN_ADDR").unwrap_or_else(|_| "0.0.0.0:8082".into()),
            tasks_topic: env::var("TOPIC_TASKS").unwrap_or_else(|_| "tasks".into()),
            events_topic: env::var("TOPIC_TASK_EVENTS")
                .or_else(|_| env::var("TOPIC_EVENTS"))
                .unwrap_or_else(|_| "task-events".into()),
        }
    }
}
