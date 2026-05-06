package com.coffeequeue.controller;

import com.coffeequeue.dto.HealthResponse;
import com.coffeequeue.dto.QueueResponse;
import com.coffeequeue.dto.QueueStats;
import com.coffeequeue.model.Order;
import com.coffeequeue.model.OrderItem;
import com.coffeequeue.service.QueueService;
import com.coffeequeue.service.MenuService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "http://127.0.0.1:3000"
}, allowCredentials = "true")
public class QueueController {
    
    @Autowired
    private QueueService queueService;
    
    @Autowired
    private MenuService menuService;
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok(new HealthResponse(
            "healthy",
            LocalDateTime.now().toString(),
            "development"
        ));
    }
    
    /**
     * Get menu items
     */
    @GetMapping("/menu")
    public ResponseEntity<Map<String, Object>> getMenu() {
        return ResponseEntity.ok(Map.of("menu", menuService.getMenu()));
    }
    
    /**
     * Place new order
     */
    @PostMapping("/orders")
    public ResponseEntity<Order> createOrder(@RequestBody Map<String, Object> request) {
        try {
            List<Map<String, Object>> itemsList = (List<Map<String, Object>>) request.get("items");
            List<OrderItem> items = itemsList.stream()
                .map(item -> {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setDrinkType((String) item.get("drinkType"));
                    orderItem.setQuantity((Integer) item.get("quantity"));
                    return orderItem;
                })
                .toList();
            
            // Handle both customerType (from new frontend) and isRegular (backward compatibility)
            String customerType = request.containsKey("customerType") 
                ? (String) request.get("customerType") 
                : "Regular";
            boolean isRegular = "Regular".equalsIgnoreCase(customerType);
            
            String customerPhone = request.containsKey("customerPhone")
                ? (String) request.get("customerPhone")
                : null;
            
            Order order = queueService.createOrder(items, isRegular, customerType, customerPhone);
            
            log.info("✅ Order placed: {} items, Type: {}, Priority Score: {}", items.size(), customerType, order.getPriorityScore());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("❌ Failed to create order", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get all orders
     */
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(queueService.getAllOrders());
    }
    
    /**
     * Complete an order
     */
    @PostMapping("/orders/{orderId}/complete")
    public ResponseEntity<Order> completeOrder(@PathVariable String orderId) {
        try {
            Order order = queueService.completeOrder(orderId);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            log.error("❌ Order not found: {}", orderId);
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get current queue status with statistics
     */
    @GetMapping("/queue")
    public ResponseEntity<QueueResponse> getQueue() {
        List<Order> waitingOrders = queueService.getWaitingOrders();
        Map<String, Object> statsMap = queueService.getQueueStats();
        
        QueueStats stats = new QueueStats(
            (Integer) statsMap.get("totalOrders"),
            Double.parseDouble((String) statsMap.get("avgWaitTime")),
            Double.parseDouble((String) statsMap.get("timeoutRate"))
        );
        
        QueueResponse response = new QueueResponse(
            waitingOrders,
            queueService.getBaristas(),
            stats
        );
        
        return ResponseEntity.ok(response);
    }
}
