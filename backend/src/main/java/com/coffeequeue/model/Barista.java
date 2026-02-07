package com.coffeequeue.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "baristas")
public class Barista {
    @Id
    private String id;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "status")
    private String status;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_order_id")
    private Order currentOrder;
    
    @Column(name = "orders_completed")
    private int ordersCompleted;
    
    @Column(name = "total_prep_time")
    private long totalPrepTime;
    
    @Column(name = "skips_penalty")
    private int skipsPenalty;
    
    @Column(name = "fairness_violations")
    private long fairnessViolations;
}
