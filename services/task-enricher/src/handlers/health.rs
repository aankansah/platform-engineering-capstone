use actix_web::{get, HttpResponse, Responder};
use std::time::Duration;
use std::net::{SocketAddr, ToSocketAddrs, TcpStream};

#[get("/health")]
pub async fn health() -> impl Responder {
    HttpResponse::Ok().body("ok")
}

// Readiness checks whether the service can reach the configured Kafka broker.
// It attempts a TCP connection to the first broker address found in `KAFKA_BROKERS`.
// If the connection succeeds within 1 second, the service is considered ready.
#[get("/ready")]
pub async fn ready() -> impl Responder {
    let brokers = std::env::var("KAFKA_BROKERS").unwrap_or_else(|_| "".into());
    let first = brokers.split(',').next().unwrap_or("");

    if first.is_empty() {
        return HttpResponse::ServiceUnavailable().body("no brokers configured");
    }

    // Split host:port
    let mut parts = first.split(':');
    let host = parts.next().unwrap_or("");
    let port = parts.next().and_then(|p| p.parse::<u16>().ok()).unwrap_or(9092);

    let addr = format!("{}:{}", host, port);
    // Resolve to socket addresses
    let addrs_iter = match addr.to_socket_addrs() {
        Ok(a) => a,
        Err(_) => return HttpResponse::ServiceUnavailable().body("invalid broker address"),
    };

    let timeout = Duration::from_secs(1);
    for socket in addrs_iter {
        if TcpStream::connect_timeout(&socket, timeout).is_ok() {
            return HttpResponse::Ok().body("ready");
        }
    }

    HttpResponse::ServiceUnavailable().body("unreachable")
}


#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test, App};

    #[actix_web::test]
    async fn test_health_ok() {
        let app = test::init_service(App::new().service(health)).await;
        let req = test::TestRequest::get().uri("/health").to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }

    #[actix_web::test]
    async fn test_ready_unreachable() {
        // set broker to an unreachable port
        std::env::set_var("KAFKA_BROKERS", "127.0.0.1:1");
        let app = test::init_service(App::new().service(ready)).await;
        let req = test::TestRequest::get().uri("/ready").to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_server_error());
    }
}
