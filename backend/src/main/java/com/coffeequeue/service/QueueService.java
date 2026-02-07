package com.coffeequeue.service;

import com.coffeequeue.model.*;
import com.coffeequeue.repository.OrderRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class QueueService {
    
    private final OrderRepository orderRepository;
    private final MenuService menuService;
    
    public QueueService(OrderRepository orderRepository, MenuService menuService) {
        this.orderRepository = orderRepository;
        this.menuService = menuService;
    }
    
    /**
     * Create a new order
     */
    public Order createOrder(List<OrderItem> items, boolean isRegular) {
        Order order = new Order();
        order.setItems(items);
        order.setRegular(isRegular);
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
        
        order = orderRepository.save(order);
        log.info("Order created: {} priority={}", order.getId(), score);
        
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
        if (order.isRegular()) {
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
        return orderRepository.findByStatus(Order.OrderStatus.WAITING).stream()
            .sorted((a, b) -> Double.compare(b.getPriorityScore(), a.getPriorityScore()))
            .collect(Collectors.toList());
    }
    
    /**
     * Get all orders
     */
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    /**
     * Get order by ID
     */
    public Order getOrderById(String orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }
    
    /**
     * Complete an order
     */
    public Order completeOrder(String orderId) {
        Optional<Order> opt = orderRepository.findById(orderId);
        if (opt.isPresent()) {
            Order order = opt.get();
            order.setStatus(Order.OrderStatus.COMPLETED);
            order.setCompletionTime(LocalDateTime.now());
            orderRepository.save(order);
            log.info("Order completed: {}", orderId);
            return order;
        }
        throw new IllegalArgumentException("Order not found: " + orderId);
    }
    
    /**
     * Get queue stats
     */
    public Map<String, Object> getQueueStats() {
        List<Order> completed = orderRepository.findByStatus(Order.OrderStatus.COMPLETED);
        
        double avgWait = 0;
        if (!completed.isEmpty()) {
            avgWait = completed.stream()
                .mapToLong(o -> ChronoUnit.MINUTES.between(o.getArrivalTime(), o.getCompletionTime()))
                .average()
                .orElse(0);
        }
        
        List<Order> allOrders = orderRepository.findAll();
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
