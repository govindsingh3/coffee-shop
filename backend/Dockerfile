# Production stage - Using pre-built JAR
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
ENV PORT=3000
ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENV SPRING_PROFILES_ACTIVE=docker

# Copy pre-built JAR
COPY target/coffee-shop-queue-*.jar app.jar

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
