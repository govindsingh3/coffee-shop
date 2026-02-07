package com.coffeequeue.service;

import com.coffeequeue.model.Barista;
import com.coffeequeue.model.Order;
import com.coffeequeue.repository.BaristaRepository;
import com.coffeequeue.repository.OrderRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BaristaService {
    
    private final BaristaRepository baristaRepository;
    private final OrderRepository orderRepository;
    private final QueueService queueService;
    private boolean initialized = false;
    
    public BaristaService(BaristaRepository baristaRepository, OrderRepository orderRepository, QueueService queueService) {
        this.baristaRepository = baristaRepository;
        this.orderRepository = orderRepository;
        this.queueService = queueService;
    }
    
    /**
     * Initialize barista pool (3 baristas)
     */
    public synchronized void initializeBaristas() {
        if (initialized) return;
        
        // Check if baristers already exist in database
        long count = baristaRepository.findAll().size();
        if (count > 0) {
            initialized = true;
            return;
        }
        
        Barista barista1 = new Barista();
        barista1.setId("barista-1");
        barista1.setName("Barista 1");
        barista1.setStatus("IDLE");
        barista1.setOrdersCompleted(0);
        barista1.setTotalPrepTime(0);
        barista1.setSkipsPenalty(0);
        barista1.setFairnessViolations(0);
        
        Barista barista2 = new Barista();
        barista2.setId("barista-2");
        barista2.setName("Barista 2");
        barista2.setStatus("IDLE");
        barista2.setOrdersCompleted(0);
        barista2.setTotalPrepTime(0);
        barista2.setSkipsPenalty(0);
        barista2.setFairnessViolations(0);
        
        Barista barista3 = new Barista();
        barista3.setId("barista-3");
        barista3.setName("Barista 3");
        baristaRepository.save(barista1);
        baristaRepository.save(barista2);
        baristaRepository.save(barista3);
        
        initialized = true;
        log.info("✅ Initialized 3 baristas in database");
    }
    
    /**
     * Get all baristas
     */
    public List<Barista> getAll() {
        if (!initialized) initializeBaristas();
        return baristaRepository.findAll();
    }
    /**
     * Get all baristas
     */
    public List<Barista> getAllBaristas() {
        if (!initialized) initializeBaristas();
        return baristaRepository.findAll();
    }
    
    /**
     * Get barista by ID
     */
    public Barista getBaristaById(String id) {
        if (!initialized) initializeBaristas();
        return baristaRepository.findById(id).orElse(null);
    }
    
    /**
     * Calculate workload for each barista (in minutes)
     */
    public long calculateWorkload(Barista barista) {
        Order current = barista.getCurrentOrder();
        if (current == null) return 0;
        return (long) current.getTotalPrepTime();
    }
    
    /**
     * Calculate workload ratio (current / average)
     */
    public double calculateWorkloadRatio(Barista barista) {
        if (!initialized) initializeBaristas();
        
        long currentWorkload = calculateWorkload(barista);
        List<Barista> allBaristas = baristaRepository.findAll();
        long totalWorkload = allBaristas.stream()
            .mapToLong(this::calculateWorkload)
            .sum();
        
        double averageWorkload = (double) totalWorkload / allBaristas.size();
        if (averageWorkload == 0) return 0;
        
        return currentWorkload / averageWorkload;
    }
    
    /**
     * Get least busy barista (workload balancing)
     */
    public Barista getLeastBusyBarista() {
        if (!initialized) initializeBaristas();
        
        List<Barista> all = baristaRepository.findAll();
        return all.stream()
            .min(Comparator.comparingLong(this::calculateWorkload))
            .orElse(all.isEmpty() ? null : all.get(0));
    }
    
    /**
     * Get overloaded baristas (>1.2x average workload)
     */
    public List<Barista> getOverloadedBaristas() {
        if (!initialized) initializeBaristas();
        
        List<Barista> all = baristaRepository.findAll();
        return all.stream()
            .filter(b -> calculateWorkloadRatio(b) > 1.2)
            .collect(Collectors.toList());
    }
    
    /**
     * Get underutilized baristas (<0.8x average workload)
     */
    public List<Barista> getUnderutilizedBaristas() {
        if (!initialized) initializeBaristas();
        
        List<Barista> all = baristaRepository.findAll();
        return all.stream()
            .filter(b -> calculateWorkloadRatio(b) < 0.8)
            .collect(Collectors.toList());
    }
    
    /**
     * Calculate workload balance percentage (target: 98%)
     * Uses standard deviation of workloads divided by mean
     */
    public double calculateWorkloadBalance() {
        if (!initialized) initializeBaristas();
        
        List<Barista> all = baristaRepository.findAll();
        long[] workloads = all.stream()
            .mapToLong(this::calculateWorkload)
            .toArray();
        
        if (workloads.length == 0) return 100.0;
        
        double mean = Arrays.stream(workloads).average().orElse(0);
        if (mean == 0) return 100.0;
        
        double variance = Arrays.stream(workloads)
            .mapToDouble(w -> Math.pow(w - mean, 2))
            .average()
            .orElse(0);
        
        double stdDev = Math.sqrt(variance);
        double coeffVariation = stdDev / mean; // Coefficient of variation
        
        // Convert to balance percentage (100% = perfect balance)
        return Math.max(0, 100 - (coeffVariation * 100));
    }
    
    /**
     * Assign order to barista
     */
    public synchronized void assignOrderToBarista(Order order, Barista barista) {
        if (order.getAssignedBarista() != null && !order.getAssignedBarista().isEmpty()) {
            // Reassignment
            log.warn("⚠️ Order {} reassigned from {} to {}", order.getId(), order.getAssignedBarista(), barista.getId());
        }
        
        order.setAssignedBarista(barista.getId());
        order.setStatus(Order.OrderStatus.PREPARING);
        barista.setCurrentOrder(order);
        barista.setStatus("BUSY");
        
        baristaRepository.save(barista);
        orderRepository.save(order);
        
        log.info("✅ Order {} assigned to {}", order.getId(), barista.getName());
    }
    
    /**
     * Complete order and free up barista
     */
    public synchronized void completeOrderForBarista(String orderId, String baristaId) {
        try {
            Barista barista = getBaristaById(baristaId);
            if (barista == null) {
                log.error("❌ Barista not found: {}", baristaId);
                throw new IllegalArgumentException("Barista not found: " + baristaId);
            }
            
            Order currentOrder = barista.getCurrentOrder();
            if (currentOrder == null) {
                log.warn("⚠️ Barista {} has no current order", barista.getName());
                // Still mark as idle if no order
                barista.setStatus("IDLE");
                baristaRepository.save(barista);
                return;
            }
            
            if (!currentOrder.getId().equals(orderId)) {
                log.error("❌ Order mismatch: barista {} has order {} but trying to complete {}", 
                    baristaId, currentOrder.getId(), orderId);
                throw new IllegalArgumentException("Order mismatch for barista");
            }
            
            int prepTime = currentOrder.getTotalPrepTime();
            barista.setOrdersCompleted(barista.getOrdersCompleted() + 1);
            barista.setTotalPrepTime(barista.getTotalPrepTime() + prepTime);
            barista.setCurrentOrder(null);
            barista.setStatus("IDLE");
            
            baristaRepository.save(barista);
            log.info("✅ Barista {} completed order {}", barista.getName(), orderId);
        } catch (Exception e) {
            log.error("❌ Failed to complete order for barista", e);
            throw new RuntimeException("Failed to complete order: " + e.getMessage(), e);
        }
    }
    
    /**
     * Smart assignment algorithm - assign next order to appropriate barista
     * Strategy:
     * 1. Get highest-priority waiting order
     * 2. If overloaded baristas exist, prefer least-loaded overloaded barista for short orders
     * 3. Otherwise, assign to least-busy barista
     */
    public synchronized void autoAssignNextOrder() {
        if (!initialized) initializeBaristas();
        
        List<Order> waitingOrders = queueService.getWaitingOrders();
        if (waitingOrders.isEmpty()) return;
        
        Order nextOrder = waitingOrders.get(0); // Highest priority
        
        // Check for overloaded baristas
        List<Barista> overloaded = getOverloadedBaristas();
        Barista assignTo;
        
        if (!overloaded.isEmpty() && nextOrder.getTotalPrepTime() <= 2) {
            // Short order and overloaded baristas exist -> assign to least-loaded overloaded
            assignTo = overloaded.stream()
                .min(Comparator.comparingLong(this::calculateWorkload))
                .orElseGet(this::getLeastBusyBarista);
        } else {
            // Normal case -> assign to least busy
            assignTo = getLeastBusyBarista();
        }
        
        assignOrderToBarista(nextOrder, assignTo);
    }
    
    /**
     * Get barista statistics
     */
    public Map<String, Object> getBaristaStats(Barista barista) {
        return Map.of(
            "id", barista.getId(),
            "name", barista.getName(),
            "status", barista.getStatus(),
            "ordersCompleted", barista.getOrdersCompleted(),
            "currentWorkload", calculateWorkload(barista),
            "workloadRatio", String.format("%.2f", calculateWorkloadRatio(barista)),
            "totalPrepTime", barista.getTotalPrepTime(),
            "currentOrder", barista.getCurrentOrder() != null ? Map.of(
                "id", barista.getCurrentOrder().getId(),
                "items", barista.getCurrentOrder().getItems(),
                "prepTime", barista.getCurrentOrder().getTotalPrepTime()
            ) : null,
            "avgPrepTimePerOrder", barista.getOrdersCompleted() > 0 
                ? barista.getTotalPrepTime() / barista.getOrdersCompleted() 
                : 0
        );
    }
    
    /**
     * Get all barista stats
     */
    public Map<String, Object> getAllBaristaStats() {
        if (!initialized) initializeBaristas();
        
        List<Barista> all = baristaRepository.findAll();
        List<Map<String, Object>> stats = all.stream()
            .map(this::getBaristaStats)
            .collect(Collectors.toList());
        
        return Map.of(
            "baristas", stats,
            "totalCompleted", all.stream().mapToInt(Barista::getOrdersCompleted).sum(),
            "workloadBalance", String.format("%.1f%%", calculateWorkloadBalance()),
            "overloadedCount", getOverloadedBaristas().size(),
            "underutilizedCount", getUnderutilizedBaristas().size()
        );
    }
}
