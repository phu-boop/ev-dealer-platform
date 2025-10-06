# =========================
# Stage 1: Build common-lib
# =========================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS common-lib
WORKDIR /build/common-lib

# Copy common-lib từ root context
COPY common-lib/pom.xml ./pom.xml
COPY common-lib/src ./src

# Build và install vào local Maven repo
RUN mvn clean install -DskipTests


# =========================
# Stage 2: Build gateway-service
# =========================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app/gateway

# Copy gateway source code
COPY gateway/pom.xml .
COPY gateway/src ./src

# Copy toàn bộ project để Maven resolve các dependency khác
COPY . .

# Copy local Maven repo từ stage common-lib
COPY --from=common-lib /root/.m2 /root/.m2

# Build gateway jar
RUN mvn clean package -DskipTests


# =========================
# Stage 3: Run gateway-service
# =========================
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app/gateway

# Copy JAR từ stage 2
COPY --from=builder /app/gateway/target/gateway-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# Chạy gateway
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]
