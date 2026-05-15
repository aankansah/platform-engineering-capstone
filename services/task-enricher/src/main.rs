mod config;
mod models;
mod kafka;
mod services;
mod handlers;

use actix_web::{App, HttpServer, web};
use config::Settings;
use kafka::producer::create_producer;
use kafka::consumer::start_consumer;
use tracing_subscriber::prelude::*;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // tracing
    tracing_subscriber::fmt::init();

    let settings = Settings::from_env();

    let producer = create_producer(&settings.kafka_brokers);

    // spawn consumer
    let brokers = settings.kafka_brokers.clone();
    let group = settings.consumer_group.clone();
    let prod_clone = producer.clone();
    actix_web::rt::spawn(async move {
        start_consumer(&brokers, &group, prod_clone).await;
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
