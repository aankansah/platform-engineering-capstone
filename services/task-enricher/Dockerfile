FROM rust:1.72 as builder
WORKDIR /usr/src/task-enricher
COPY Cargo.toml Cargo.lock ./
COPY src ./src

# Build in release mode
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/src/task-enricher/target/release/task-enricher /usr/local/bin/task-enricher
EXPOSE 8080
CMD ["/usr/local/bin/task-enricher"]
