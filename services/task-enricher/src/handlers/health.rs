use actix_web::{get, HttpResponse, Responder};

#[get("/health")]
pub async fn health() -> impl Responder {
    HttpResponse::Ok().body("ok")
}

#[get("/ready")]
pub async fn ready() -> impl Responder {
    HttpResponse::Ok().body("ready")
}
