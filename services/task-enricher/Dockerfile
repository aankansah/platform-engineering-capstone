FROM rust:1-bookworm AS builder
WORKDIR /usr/src/task-enricher
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        -o Acquire::Retries=5 \
        --fix-missing \
        cmake \
    && rm -rf /var/lib/apt/lists/*
COPY Cargo.toml Cargo.lock ./
COPY src ./src

# Build in release mode
RUN cargo build --release --locked \
    && strip target/release/task-enricher

FROM debian:bookworm-slim
# Install minimal runtime dependencies (zlib and CA certs) so the
# statically-built binary can run and TLS (if used) works.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates zlib1g \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/task-enricher/target/release/task-enricher /usr/local/bin/task-enricher
RUN chmod +x /usr/local/bin/task-enricher
EXPOSE 8080
CMD ["/usr/local/bin/task-enricher"]
