# Stage 1: build
FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copy toàn bộ source code vào container
COPY . .

# Build project, bỏ qua test
RUN mvn clean package -DskipTests

# Stage 2: run
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# Copy JAR đã build từ stage trước
COPY --from=builder /app/target/gateway-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# Chạy JAR
ENTRYPOINT ["java", "-jar", "app.jar"]
