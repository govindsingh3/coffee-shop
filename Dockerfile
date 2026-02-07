# Build stage - Frontend
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client ./
RUN npm run build

# Build stage - Backend (Java)
FROM maven:3.9.2-eclipse-temurin-17 AS backend-builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Production stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
ENV PORT=3000
COPY --from=backend-builder /app/target/coffee-shop-queue-*.jar app.jar
COPY --from=client-builder /app/client/dist ./static

EXPOSE 3000
ENTRYPOINT ["java", "-jar", "app.jar"]
