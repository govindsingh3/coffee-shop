# Coffee Shop Queue - Backend

Spring Boot REST API for the Smart Coffee Shop Queue System with priority-based order management.

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.6+

### Build
```bash
cd backend
mvn clean package
```

### Run
```bash
# Run directly from JAR (recommended)
java -jar target/coffee-shop-queue-1.0.0.jar

# Or using Maven
mvn spring-boot:run
```

The server will start on **http://localhost:3000/api**

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/menu` - Get available menu items
- `POST /api/orders` - Place a new order
- `GET /api/queue` - Get current queue status
- `GET /api/queue/stats` - Get queue statistics

## Environment

- Port: 3000
- Context Path: `/api`
- CORS: Enabled for localhost:5173-5176 and 3000

## Architecture

- **Service Layer**: `QueueService.java` - Smart queue management with priority scoring
- **Controllers**: `QueueController.java` - REST API endpoints
- **Models**: Order, Barista, Drink entities
- **DTOs**: Response DTOs for API responses

## Technologies

- Spring Boot 3.2.0
- Spring Web (REST)
- Spring WebSocket
- Lombok
- Maven
