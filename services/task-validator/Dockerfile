FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
COPY src src

RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jdk-alpine AS runtime
RUN jlink \
    --add-modules java.base,java.desktop,java.instrument,java.logging,java.management,java.naming,java.net.http,java.security.jgss,java.sql,java.xml,jdk.crypto.ec,jdk.management,jdk.unsupported \
    --strip-debug \
    --no-header-files \
    --no-man-pages \
    --compress=2 \
    --output /opt/java-runtime

FROM alpine:3.20
WORKDIR /app
ENV JAVA_HOME=/opt/java-runtime
ENV PATH="${JAVA_HOME}/bin:${PATH}"
ENV JAVA_OPTS=""

COPY --from=build /app/target/*.jar app.jar
COPY --from=runtime /opt/java-runtime /opt/java-runtime

EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
