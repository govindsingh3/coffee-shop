package com.coffeequeue.controller;

import com.coffeequeue.model.Order;
import com.coffeequeue.repository.OrderRepository;
import com.coffeequeue.service.MenuService;
import com.coffeequeue.service.QueueService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@Slf4j
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private QueueService queueService;

    @Autowired
    private MenuService menuService;

    /**
     * Get dashboard stats: revenue, orders count, avg order value
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        List<Order> allOrders = queueService.getAllOrders();
        
        // Today's orders
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        List<Order> todayOrders = allOrders.stream()
            .filter(o -> o.getArrivalTime() != null && o.getArrivalTime().isAfter(startOfDay))
            .collect(Collectors.toList());
        
        long todayCompleted = todayOrders.stream()
            .filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED)
            .count();
        
        long todayWaiting = todayOrders.stream()
            .filter(o -> o.getStatus() == Order.OrderStatus.WAITING)
            .count();

        // Revenue estimation (based on item count * avg price)
        double todayRevenue = todayOrders.stream()
            .filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED)
            .flatMapToInt(o -> o.getItems().stream().mapToInt(i -> i.getQuantity() * 175))
            .sum();

        double avgOrderValue = todayCompleted > 0 ? todayRevenue / todayCompleted : 0;

        // Revenue by hour (for chart)
        Map<Integer, Double> hourlyRevenue = new TreeMap<>();
        for (int h = 6; h <= 22; h++) hourlyRevenue.put(h, 0.0);
        todayOrders.stream()
            .filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED && o.getArrivalTime() != null)
            .forEach(o -> {
                int hour = o.getArrivalTime().getHour();
                double orderValue = o.getItems().stream().mapToInt(i -> i.getQuantity() * 175).sum();
                hourlyRevenue.merge(hour, orderValue, Double::sum);
            });

        // Popular items
        Map<String, Integer> itemCounts = new HashMap<>();
        allOrders.forEach(o -> o.getItems().forEach(i -> 
            itemCounts.merge(i.getDrinkType(), i.getQuantity(), Integer::sum)
        ));
        List<Map<String, Object>> popularItems = itemCounts.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(6)
            .map(e -> Map.<String, Object>of("name", e.getKey(), "count", e.getValue()))
            .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
            "todayOrders", todayOrders.size(),
            "todayCompleted", todayCompleted,
            "todayWaiting", todayWaiting,
            "todayRevenue", todayRevenue,
            "avgOrderValue", Math.round(avgOrderValue * 100.0) / 100.0,
            "totalOrders", allOrders.size(),
            "hourlyRevenue", hourlyRevenue,
            "popularItems", popularItems
        ));
    }

    /**
     * Get all orders (paginated, filterable)
     */
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrderHistory(
        @RequestParam(required = false) String status
    ) {
        List<Order> orders = queueService.getAllOrders();
        if (status != null && !status.isEmpty()) {
            Order.OrderStatus filterStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            orders = orders.stream()
                .filter(o -> o.getStatus() == filterStatus)
                .collect(Collectors.toList());
        }
        // Sort newest first
        orders.sort((a, b) -> {
            if (a.getArrivalTime() == null) return 1;
            if (b.getArrivalTime() == null) return -1;
            return b.getArrivalTime().compareTo(a.getArrivalTime());
        });
        return ResponseEntity.ok(orders);
    }

    /**
     * Get menu for admin management
     */
    @GetMapping("/menu")
    public ResponseEntity<Map<String, Object>> getMenuForAdmin() {
        return ResponseEntity.ok(Map.of("menu", menuService.getMenu()));
    }
}
