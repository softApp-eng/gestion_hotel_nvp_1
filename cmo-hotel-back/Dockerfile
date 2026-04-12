# Use a lightweight JRE image for Java 22
FROM eclipse-temurin:22-jre-alpine
WORKDIR /app

# Create a non-root user for better security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the JAR from your local machine into the container
# Adjust "target/*.jar" to "build/libs/*.jar" if using Gradle
COPY target/*.jar app.jar

# Expose the application port
EXPOSE 8888

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
