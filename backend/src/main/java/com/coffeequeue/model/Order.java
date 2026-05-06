package com.coffeequeue.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {
    private String id;
    private String customerId;
    private List<OrderItem> items;
    private int totalPrepTime;
    private LocalDateTime arrivalTime;
    private String assignedBarista;
    private OrderStatus status;
    private double priorityScore;
    private boolean regular;
    private String customerType;
    private String customerPhone;
    private LocalDateTime startTime;
    private LocalDateTime completionTime;

    // Lombok will generate constructors; use setters where initialization is needed

    public enum OrderStatus {
        WAITING, PREPARING, READY, COMPLETED
    }
}
