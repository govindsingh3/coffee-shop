# MySQL Database Integration

## Overview

The Coffee Shop Queue System now includes MySQL database integration alongside the existing MongoDB support. This provides a robust relational database backend for managing orders, baristers, and operational metrics.

## Database Configuration

### Local Development (Properties File)

Database configuration is managed in [src/main/resources/application.properties](src/main/resources/application.properties):

```properties
# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/coffee_shop?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=coffee_user
spring.datasource.password=coffee_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

### Docker Deployment

When using Docker Compose, MySQL service is automatically configured and started. The backend application connects to MySQL through the Docker network:

```yaml
mysql:
  image: mysql:8.0
  ports:
    - "3306:3306"
  environment:
    MYSQL_ROOT_PASSWORD: root_password
    MYSQL_DATABASE: coffee_shop
    MYSQL_USER: coffee_user
    MYSQL_PASSWORD: coffee_password
  volumes:
    - mysql_data:/var/lib/mysql
```

## Database Schema

### Tables

#### orders
- `id` (VARCHAR, Primary Key) - Unique order identifier
- `customer_id` (VARCHAR) - Customer reference
- `total_prep_time` (INT) - Total preparation time in seconds
- `arrival_time` (DATETIME) - When the order arrived
- `assigned_barista` (VARCHAR) - Assigned barista ID
- `status` (ENUM) - Order status: WAITING, PREPARING, READY, COMPLETED
- `priority_score` (DOUBLE) - Priority calculation score
- `is_regular` (BOOLEAN) - Whether customer is a regular
- `start_time` (DATETIME) - When preparation started
- `completion_time` (DATETIME) - When order was completed

#### order_items
- `id` (BIGINT, Primary Key, Auto-increment) - Item identifier
- `order_id` (VARCHAR, Foreign Key) - References orders table
- `drink_type` (VARCHAR) - Type of drink
- `quantity` (INT) - Quantity ordered
- `prep_time` (BIGINT) - Preparation time for this item
- `price` (DOUBLE) - Item price

#### baristas
- `id` (VARCHAR, Primary Key) - Barista identifier
- `name` (VARCHAR) - Barista name
- `status` (VARCHAR) - Current status: IDLE, BUSY
- `current_order_id` (VARCHAR, Foreign Key) - Currently serving order
- `orders_completed` (INT) - Total orders completed
- `total_prep_time` (BIGINT) - Cumulative preparation time
- `skips_penalty` (INT) - Fairness penalty count
- `fairness_violations` (BIGINT) - Count of fairness issues

## JPA Repositories

Created repository interfaces for database operations:

- **OrderRepository** - [backend/src/main/java/com/coffeequeue/repository/OrderRepository.java](backend/src/main/java/com/coffeequeue/repository/OrderRepository.java)
  - Query orders by status, barista, customer, time range, or regular status

- **BaristaRepository** - [backend/src/main/java/com/coffeequeue/repository/BaristaRepository.java](backend/src/main/java/com/coffeequeue/repository/BaristaRepository.java)
  - Query baristas by status

- **OrderItemRepository** - [backend/src/main/java/com/coffeequeue/repository/OrderItemRepository.java](backend/src/main/java/com/coffeequeue/repository/OrderItemRepository.java)
  - Query items for specific orders

## Entity Models

Updated model classes with JPA annotations:

- **Order** ([backend/src/main/java/com/coffeequeue/model/Order.java](backend/src/main/java/com/coffeequeue/model/Order.java))
  - JPA Entity with @Table mapping
  - One-to-many relationship with OrderItems
  - PrePersist hook for auto-generating IDs

- **OrderItem** ([backend/src/main/java/com/coffeequeue/model/OrderItem.java](backend/src/main/java/com/coffeequeue/model/OrderItem.java))
  - JPA Entity with auto-incrementing primary key
  - Many-to-one relationship with Order

- **Barista** ([backend/src/main/java/com/coffeequeue/model/Barista.java](backend/src/main/java/com/coffeequeue/model/Barista.java))
  - JPA Entity with string primary key
  - Many-to-one relationship with Order

## Dependencies

Added to pom.xml:

```xml
<!-- MySQL Driver -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

Spring Data JPA was already included in the project.

## Running with Docker Compose

```bash
docker-compose up --build
```

This will:
1. Start MySQL service (port 3306) - automatically initializes database
2. Start MongoDB service (port 27017) - optional, kept for compatibility
3. Build and start backend service (port 3000) - automatically creates schema
4. Start frontend service (port 5173)

### First Run

On the first run with `ddl-auto=create-drop`, Hibernate will:
1. Drop existing tables
2. Create new tables based on JPA entity mappings
3. Schema is automatically generated from entity annotations

## Database Connection Verification

### From Host Machine

```bash
mysql -h 127.0.0.1 -u coffee_user -p
# Password: coffee_password
```

```sql
USE coffee_shop;
SHOW TABLES;
SHOW CREATE TABLE orders;
```

### From Backend Logs

Check application startup logs for JPA schema creation and connection confirmation in docker logs:

```bash
docker-compose logs backend
```

## Development Notes

### Switching to MySQL from MongoDB

To use MySQL exclusively (disable MongoDB):
1. Application uses MySQL by default
2. MongoDB environment is excluded from auto-configuration
3. MongoDB service in docker-compose can be removed if not needed

### Adding New Entities

When adding new entities:
1. Create class with `@Entity` and `@Table` annotations
2. Add `@Id` primary key field
3. Use `@Column` for field mappings
4. Create corresponding `JpaRepository` interface
5. Hibernate will auto-create table on startup (with `ddl-auto=create-drop`)

### Performance Considerations

- Current configuration uses `ddl-auto=create-drop`, suitable for development
- For production, change to `ddl-auto=validate`
- Add database indexes on frequently queried fields
- Consider connection pooling configuration if experiencing heavy load

## Troubleshooting

### MySQL Connection Issues
- Verify MySQL container is running: `docker ps | grep mysql`
- Check MySQL health: `docker-compose ps`
- Review logs: `docker-compose logs mysql`

### Schema Not Creating
- Check backend logs for Hibernate errors: `docker-compose logs backend`
- Verify database user has CREATE TABLE permissions
- Ensure entity classes have proper JPA annotations

### Performance Tips
- Add indexes on `order_id`, `barista_id`, `status` columns
- Enable MySQL query caching if workload is read-heavy
- Use connection pooling (HikariCP configured automatically)
