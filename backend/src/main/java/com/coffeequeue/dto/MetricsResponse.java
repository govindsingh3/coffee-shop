package com.coffeequeue.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MetricsResponse {
    private long totalOrdersProcessed;
    private double avgWaitTimeMinutes;
    private double avgOrderComplexity;
    private int totalCustomersServed;
    private double workloadBalance;
    private double fairnessScore;
    private long timeoutsCount;
    private long regularCustomersCount;
}
