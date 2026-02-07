package com.coffeequeue.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QueueStats {
    private int totalOrders;
    private double avgWaitTime;
    private double timeoutRate;
}
