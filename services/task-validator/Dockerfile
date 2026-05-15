FROM eclipse-temurin:21-jdk-alpine as build
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
COPY src src

RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS=""
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
