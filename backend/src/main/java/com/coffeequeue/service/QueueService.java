package com.coffeequeue.service;

import com.coffeequeue.model.*;
import com.coffeequeue.repository.OrderRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class QueueService {
    
    private final MenuService menuService;
    private final WhatsAppNotificationService whatsappService;
    
    @Autowired(required = false)
    private OrderRepository orderRepository;
    
    // In-memory fallback when MongoDB is unavailable
    private final List<Order> inMemoryOrders = Collections.synchronizedList(new ArrayList<>());
    
    public QueueService(MenuService menuService, WhatsAppNotificationService whatsappService) {
        this.menuService = menuService;
        this.whatsappService = whatsappService;
    }
    
    private boolean isMongoAvailable() {
        return orderRepository != null;
    }

    private List<Order> getAllOrdersInternal() {
        if (isMongoAvailable()) {
            try {
                return orderRepository.findAll();
            } catch (Exception e) {
                log.warn("MongoDB unavailable, using in-memory store: {}", e.getMessage());
                return inMemoryOrders;
            }
        }
        return inMemoryOrders;
    }

    private Order saveOrder(Order order) {
        if (isMongoAvailable()) {
            try {
                return orderRepository.save(order);
            } catch (Exception e) {
                log.warn("MongoDB save failed, using in-memory: {}", e.getMessage());
            }
        }
        // In-memory fallback
        inMemoryOrders.removeIf(o -> o.getId().equals(order.getId()));
        inMemoryOrders.add(order);
        return order;
    }
    
    /**
     * Create a new order
     */
    public Order createOrder(List<OrderItem> items, boolean isRegular, String customerType, String customerPhone) {
        Order order = new Order();
        order.setId(UUID.randomUUID().toString());
        order.setItems(items);
        order.setRegular(isRegular);
        order.setCustomerType(customerType);
        order.setCustomerPhone(customerPhone);
        order.setStatus(Order.OrderStatus.WAITING);
        order.setArrivalTime(LocalDateTime.now());
        
        // Calculate total prep time
        int totalTime = 0;
        for (OrderItem item : items) {
            Drink d = menuService.getDrink(item.getDrinkType());
            int prepTime = d != null ? d.getPrepTime() : 5;
            totalTime += prepTime * item.getQuantity();
        }
        order.setTotalPrepTime(totalTime);
        
        // Calculate initial priority
        double score = calculatePriorityScore(order, LocalDateTime.now());
        order.setPriorityScore(score);
        
        saveOrder(order);
        log.info("Order created: {} priority={}", order.getId(), score);
        
        if (customerPhone != null && !customerPhone.isEmpty()) {
            whatsappService.sendOrderConfirmation(order, customerPhone);
        }
        
        return order;
    }
    
    /**
     * Calculate priority score (40% wait + 25% complexity + 10% loyalty + 25% urgency)
     */
    public double calculatePriorityScore(Order order, LocalDateTime now) {
        if (order.getArrivalTime() == null) return 0;
        long waitMinutes = ChronoUnit.MINUTES.between(order.getArrivalTime(), now);
        int prepTime = order.getTotalPrepTime();
        
        double score = 0.0;
        
        // Wait time (40%) - max 40 for 10+ min
        score += Math.min(waitMinutes * 4.0, 40);
        
        // Complexity (25%) - shorter orders get bonus
        double complexBonus = Math.max(0, 25 - (prepTime / 6.0) * 25);
        score += complexBonus;
        
        // Loyalty (10%)
        if ("VIP Premium".equalsIgnoreCase(order.getCustomerType())) {
            score += 20;
        } else if (order.isRegular() || "Regular".equalsIgnoreCase(order.getCustomerType())) {
            score += 10;
        }
        
        // Urgency (25%) - emergency boost at 8+ min
        if (waitMinutes >= 8) {
            score += 25 + Math.min(waitMinutes - 8, 25);
        }
        
        return Math.min(score, 100);
    }
    
    /**
     * Get waiting orders sorted by priority
     */
    public List<Order> getWaitingOrders() {
        return getAllOrdersInternal().stream()
            .filter(o -> o.getStatus() == Order.OrderStatus.WAITING)
            .sorted((a, b) -> Double.compare(b.getPriorityScore(), a.getPriorityScore()))
            .collect(Collectors.toList());
    }
    
    /**
     * Get all orders
     */
    public List<Order> getAllOrders() {
        return new ArrayList<>(getAllOrdersInternal());
    }
    
    /**
     * Get order by ID
     */
    public Order getOrderById(String orderId) {
        return getAllOrdersInternal().stream()
            .filter(o -> o.getId().equals(orderId))
            .findFirst()
            .orElse(null);
    }
    
    /**
     * Complete an order
     */
    public Order completeOrder(String orderId) {
        Order order = getOrderById(orderId);
        if (order != null) {
            order.setStatus(Order.OrderStatus.COMPLETED);
            order.setCompletionTime(LocalDateTime.now());
            saveOrder(order);
            log.info("Order completed: {}", orderId);
            
            if (order.getCustomerPhone() != null && !order.getCustomerPhone().isEmpty()) {
                whatsappService.sendOrderReady(order, order.getCustomerPhone());
            }
            
            return order;
        }
        throw new IllegalArgumentException("Order not found: " + orderId);
    }
    
    /**
     * Get queue stats
     */
    public Map<String, Object> getQueueStats() {
        List<Order> allOrders = getAllOrdersInternal();
        List<Order> completed = allOrders.stream()
            .filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED)
            .collect(Collectors.toList());
        
        double avgWait = 0;
        if (!completed.isEmpty()) {
            avgWait = completed.stream()
                .mapToLong(o -> ChronoUnit.MINUTES.between(o.getArrivalTime(), o.getCompletionTime()))
                .average()
                .orElse(0);
        }
        
        return Map.of(
            "totalOrders", allOrders.size(),
            "waitingOrders", getWaitingOrders().size(),
            "avgWaitTime", String.format("%.1f", avgWait),
            "timeoutRate", "0.0"
        );
    }

    /** Return baristas info (empty for now) */
    public List<com.coffeequeue.model.Barista> getBaristas() {
        return Collections.emptyList();
    }
}
