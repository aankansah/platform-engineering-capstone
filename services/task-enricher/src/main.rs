mod config;
mod handlers;
mod kafka;
mod models;
mod services;

use actix_web::{App, HttpServer};
use config::Settings;
use dotenv::dotenv;
use kafka::consumer::start_consumer;
use kafka::producer::create_producer;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // tracing
    tracing_subscriber::fmt::init();

    // load .env when present (local development)
    dotenv().ok();

    let settings = Settings::from_env();

    let producer = create_producer(&settings.kafka_brokers);

    // spawn consumer
    let brokers = settings.kafka_brokers.clone();
    let group = settings.consumer_group.clone();
    let tasks_topic = settings.tasks_topic.clone();
    let events_topic = settings.events_topic.clone();
    let prod_clone = producer.clone();
    actix_web::rt::spawn(async move {
        start_consumer(&brokers, &group, &tasks_topic, &events_topic, prod_clone).await;
    });

    HttpServer::new(|| {
        App::new()
            .service(handlers::health::health)
            .service(handlers::health::ready)
    })
    .bind(settings.listen_addr)?
    .run()
    .await
}
