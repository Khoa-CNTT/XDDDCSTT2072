# Sử dụng Oracle JDK 17 làm base image
FROM eclipse-temurin:17-jdk AS build

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép Gradle files
COPY gradle/ gradle/
COPY gradlew settings.gradle build.gradle ./

# Tải Gradle dependencies
RUN ./gradlew dependencies --no-daemon

# Sao chép source code
COPY src/ src/

# Build ứng dụng
RUN ./gradlew build -x test --no-daemon

# Stage 2: Runtime image
FROM eclipse-temurin:17-jre

WORKDIR /app

# Sao chép file JAR đã build từ stage trước
COPY --from=build /app/build/libs/*.jar app.jar

# Expose cổng mặc định của Spring Boot
EXPOSE 8080

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "/app/app.jar"] 