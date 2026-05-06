package com.coffeequeue.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Barista {
    private String id;
    private String name;
    private String status;          // IDLE, BUSY
    private Order currentOrder;
    private int ordersCompleted;
    private long totalPrepTime;     // in milliseconds
    private int skipsPenalty;
    private long fairnessViolations;
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Order getCurrentOrder() { return currentOrder; }
    public void setCurrentOrder(Order currentOrder) { this.currentOrder = currentOrder; }
    public int getOrdersCompleted() { return ordersCompleted; }
    public void setOrdersCompleted(int ordersCompleted) { this.ordersCompleted = ordersCompleted; }
    public long getTotalPrepTime() { return totalPrepTime; }
    public void setTotalPrepTime(long totalPrepTime) { this.totalPrepTime = totalPrepTime; }
    public int getSkipsPenalty() { return skipsPenalty; }
    public void setSkipsPenalty(int skipsPenalty) { this.skipsPenalty = skipsPenalty; }
    public long getFairnessViolations() { return fairnessViolations; }
    public void setFairnessViolations(long fairnessViolations) { this.fairnessViolations = fairnessViolations; }
}
