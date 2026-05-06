package com.coffeequeue.dto;

import com.coffeequeue.model.Order;

public class BaristaResponseDto {
    private String id;
    private String name;
    private String status;
    private Order currentOrder;
    private int ordersCompleted;
    private double averagePrepTime;
    private long fairnessViolations;
    
    public BaristaResponseDto() {}
    
    public BaristaResponseDto(String id, String name, String status, Order currentOrder, 
                              int ordersCompleted, double averagePrepTime, long fairnessViolations) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.currentOrder = currentOrder;
        this.ordersCompleted = ordersCompleted;
        this.averagePrepTime = averagePrepTime;
        this.fairnessViolations = fairnessViolations;
    }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Order getCurrentOrder() { return currentOrder; }
    public void setCurrentOrder(Order currentOrder) { this.currentOrder = currentOrder; }
    
    public int getOrdersCompleted() { return ordersCompleted; }
    public void setOrdersCompleted(int ordersCompleted) { this.ordersCompleted = ordersCompleted; }
    
    public double getAveragePrepTime() { return averagePrepTime; }
    public void setAveragePrepTime(double averagePrepTime) { this.averagePrepTime = averagePrepTime; }
    
    public long getFairnessViolations() { return fairnessViolations; }
    public void setFairnessViolations(long fairnessViolations) { this.fairnessViolations = fairnessViolations; }
}
