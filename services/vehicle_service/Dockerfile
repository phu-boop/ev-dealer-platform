# -------- Stage 1: Build ứng dụng --------
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy toàn bộ source code service vào
COPY . .

# Build ứng dụng (tạo file jar)
RUN mvn clean package -DskipTests

# -------- Stage 2: Chạy ứng dụng --------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Copy file JAR từ stage build
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8087

# Lệnh chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]
