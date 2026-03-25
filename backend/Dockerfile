# Step 1: Build the application using Maven
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app

# Copy the project files into the container
COPY . .

# Build the JAR file and skip tests for a faster deployment
RUN mvn clean package -DskipTests

# Step 2: Run the application using a lightweight OpenJDK image
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy the generated JAR from the build stage to the run stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port (Render will handle the actual port mapping)
EXPOSE 8080

# Command to start the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
