package com.coffeequeue.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class AlertResponse {
    private String id;
    private String type;
    private String orderId;
    private String message;
    private AlertSeverity severity;
    private LocalDateTime timestamp;
    private boolean acknowledged;
    
    public AlertResponse(String type, String orderId, String message, AlertSeverity severity) {
        this.id = UUID.randomUUID().toString();
        this.type = type;
        this.orderId = orderId;
        this.message = message;
        this.severity = severity;
        this.timestamp = LocalDateTime.now();
        this.acknowledged = false;
    }
    
    public enum AlertSeverity {
        INFO, WARNING, CRITICAL
    }
}
