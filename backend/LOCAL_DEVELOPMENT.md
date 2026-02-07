# Local Development Setup

## Quick Start Options

### Option 1: Using H2 In-Memory Database (Easiest)

Perfect for quick testing without any setup:

```bash
cd backend
java -jar target/coffee-shop-queue-1.0.0.jar --spring.profiles.active=test
```

Or with Maven:
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=test"
```

**Features:**
- No database installation required
- H2 console available at: `http://localhost:3000/api/h2-console`
- Data resets on each restart
- Ideal for development and testing

**H2 Console Credentials:**
- Default JDBC URL: `jdbc:h2:mem:coffee_shop`
- Username: `sa`
- Password: (empty)

---

### Option 2: Using Local MySQL Database

For a more persistent development environment:

#### Prerequisites
Install MySQL 8.0+ locally:
- [MySQL Download](https://dev.mysql.com/downloads/mysql/)
- Or use Docker: `docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=coffee_shop -e MYSQL_USER=coffee_user -e MYSQL_PASSWORD=coffee_password mysql:8.0`

#### Run Backend
```bash
cd backend
java -jar target/coffee-shop-queue-1.0.0.jar --spring.profiles.active=local
```

Or with Maven:
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"
```

**Configuration:** See [application-local.properties](src/main/resources/application-local.properties)

---

### Option 3: Full Docker Stack (Recommended for Integration Testing)

Runs complete stack with MySQL, MongoDB, backend, and frontend:

```bash
cd ..
docker-compose up --build
```

This will start:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **MySQL:** localhost:3306
- **MongoDB:** localhost:27017
- **H2 Console:** http://localhost:3000/api/h2-console (test profile only)

---

## Spring Profiles

### `test` (Default for Local Development)
- **Database:** H2 In-Memory
- **DDL Mode:** `update` (persists schema)
- **Use Case:** Quick development cycles, testing
- **No Setup Required:** Yes

### `local`
- **Database:** MySQL on localhost
- **DDL Mode:** `validate` (requires schema to exist)
- **Use Case:** Development with persistent data
- **Setup Required:** MySQL server on port 3306

### `dev` (Default in Docker)
- **Database:** MySQL (via Docker service name "mysql")
- **DDL Mode:** `create-drop` (auto-creates schema)
- **Use Case:** Docker container deployment
- **Setup Required:** Docker Compose

### `default` (No Profile)
- **Database:** MySQL on localhost:3306
- **Use Case:** Production
- **Setup Required:** MySQL server

---

## Configuration Files

| Profile | Config File |
|---------|------------|
| `test` | `application-test.properties` (H2) |
| `local` | `application-local.properties` (Local MySQL) |
| `dev` | `application.properties` (Docker MySQL) |

---

## Troubleshooting

### "Unable to connect to MySQL"
- **Using test profile?** Run with `--spring.profiles.active=test` instead
- **Using local profile?** Ensure MySQL is running: `mysql -u root -p`
- **Using Docker?** Ensure MySQL container is healthy: `docker-compose ps`

### "H2 console not loading"
- Ensure you're using `--spring.profiles.active=test`
- Access at: `http://localhost:3000/api/h2-console`
- JDBC URL: `jdbc:h2:mem:coffee_shop`

### "Port 3000 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # Linux/Mac
netstat -ano | findstr :3000   # Windows
```

### Data not persisting
- H2 `test` profile data only persists within a session
- For persistent data, use `--spring.profiles.active=local` with MySQL
- Or increase H2 cache with `spring.jpa.properties.hibernate.generate_statistics=true`

---

## Development Workflow

### 1. Quick Testing (Fastest)
```bash
cd backend
java -jar target/coffee-shop-queue-1.0.0.jar --spring.profiles.active=test
```

### 2. Full Stack Testing
```bash
docker-compose up --build
# Frontend: http://localhost:5173
# Backend: http://localhost:3000/api
```

### 3. Integration Testing with Real MySQL
```bash
# Start MySQL
docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=coffee_shop -e MYSQL_USER=coffee_user -e MYSQL_PASSWORD=coffee_password mysql:8.0

# Run backend
cd backend
java -jar target/coffee-shop-queue-1.0.0.jar --spring.profiles.active=local
```

---

## API Testing

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Sample Request
```bash
curl -X GET http://localhost:3000/api/queue
```

### WebSocket Connection (for real-time updates)
```
ws://localhost:3000/api/ws
```

---

## Database Migrations

For production environments, use `validate` mode and manage migrations manually or with Flyway.

### Current DDL Strategies
- **test:** `update` - Creates/updates tables as needed
- **local:** `validate` - Schema must exist
- **dev (Docker):** `create-drop` - Recreates on each startup

---

## Performance Tips

1. **For Testing:** Use H2 test profile (fastest)
2. **For Development:** Use local MySQL for persistence
3. **For Production:** Use `validate` mode with proper migrations
4. **Connection Pooling:** HikariCP configured automatically
   - Min idle: 2 connections
   - Max pool size: 5 connections

---

## Next Steps

- Review [DATABASE.md](DATABASE.md) for schema details
- Check [API_REFERENCE.md](../API_REFERENCE.md) for endpoint documentation
- Run `mvn test` to execute unit tests
