package com.coffeequeue.controller;

import com.coffeequeue.dto.HealthResponse;
import com.coffeequeue.dto.QueueResponse;
import com.coffeequeue.dto.QueueStats;
import com.coffeequeue.model.Order;
import com.coffeequeue.model.OrderItem;
import com.coffeequeue.model.Barista;
import com.coffeequeue.service.QueueService;
import com.coffeequeue.service.MenuService;
import com.coffeequeue.service.BaristaService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:3000"}, allowCredentials = "true")
public class QueueController {
    
    @Autowired
    private QueueService queueService;
    
    @Autowired
    private MenuService menuService;
    
    @Autowired
    private BaristaService baristaService;
    
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
            
            boolean isRegular = request.containsKey("isRegular") && (Boolean) request.get("isRegular");
            Order order = queueService.createOrder(items, isRegular);
            
            log.info("✅ Order placed: {} items, Priority Score: {}", items.size(), order.getPriorityScore());
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
            baristaService.getAllBaristas(),
            stats
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all baristas with their current status
     */
    @GetMapping("/baristas")
    public ResponseEntity<List<Barista>> getBaristas() {
        return ResponseEntity.ok(baristaService.getAllBaristas());
    }

    /**
     * Get barista statistics
     */
    @GetMapping("/baristas/stats")
    public ResponseEntity<Map<String, Object>> getBaristaStats() {
        return ResponseEntity.ok(baristaService.getAllBaristaStats());
    }

    /**
     * Get specific barista details
     */
    @GetMapping("/baristas/{baristaId}")
    public ResponseEntity<Map<String, Object>> getBarista(@PathVariable String baristaId) {
        Barista barista = baristaService.getBaristaById(baristaId);
        if (barista == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(baristaService.getBaristaStats(barista));
    }

    /**
     * Auto-assign next order to the most suitable barista
     */
    @PostMapping("/baristas/assign")
    public ResponseEntity<Map<String, Object>> autoAssignOrder() {
        try {
            baristaService.autoAssignNextOrder();
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Order assigned to barista"
            ));
        } catch (Exception e) {
            log.error("❌ Failed to assign order", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Complete order for specific barista
     */
    @PostMapping("/baristas/{baristaId}/orders/{orderId}/complete")
    public ResponseEntity<Map<String, Object>> completeOrderForBarista(
            @PathVariable String baristaId,
            @PathVariable String orderId) {
        try {
            log.info("📋 Attempting to complete order {} for barista {}", orderId, baristaId);
            
            // First complete order for barista (free up the barista)
            baristaService.completeOrderForBarista(orderId, baristaId);
            
            // Then complete the order in queue
            Order order = queueService.completeOrder(orderId);
            
            log.info("✅ Order {} completed successfully", orderId);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Order completed",
                "orderId", orderId
            ));
        } catch (Exception e) {
            log.error("❌ Failed to complete order: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Manually assign order to specific barista
     */
    @PostMapping("/baristas/{baristaId}/assign/{orderId}")
    public ResponseEntity<Map<String, Object>> manuallyAssignOrder(
            @PathVariable String baristaId,
            @PathVariable String orderId) {
        try {
            Barista barista = baristaService.getBaristaById(baristaId);
            if (barista == null) {
                return ResponseEntity.notFound().build();
            }
            
            Order order = queueService.getOrderById(orderId);
            if (order == null) {
                return ResponseEntity.notFound().build();
            }
            
            baristaService.assignOrderToBarista(order, barista);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Order manually assigned to barista",
                "baristaId", baristaId,
                "orderId", orderId
            ));
        } catch (Exception e) {
            log.error("❌ Failed to manually assign order", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
}
