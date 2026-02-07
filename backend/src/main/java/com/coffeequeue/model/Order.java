package com.coffeequeue.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order {
    @Id
    private String id;
    
    @Column(name = "customer_id")
    private String customerId;
    
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items;
    
    @Column(name = "total_prep_time")
    private int totalPrepTime;
    
    @Column(name = "arrival_time")
    private LocalDateTime arrivalTime;
    
    @Column(name = "assigned_barista")
    private String assignedBarista;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private OrderStatus status;
    
    @Column(name = "priority_score")
    private double priorityScore;
    
    @Column(name = "is_regular")
    private boolean regular;
    
    @Column(name = "start_time")
    private LocalDateTime startTime;
    
    @Column(name = "completion_time")
    private LocalDateTime completionTime;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.customerId == null) {
            this.customerId = UUID.randomUUID().toString();
        }
        if (this.status == null) {
            this.status = OrderStatus.WAITING;
        }
    }

    public enum OrderStatus {
        WAITING, PREPARING, READY, COMPLETED
    }
}
