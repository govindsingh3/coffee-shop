package com.coffeequeue.repository;

import com.coffeequeue.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByStatus(Order.OrderStatus status);
    List<Order> findByAssignedBarista(String baristaId);
    List<Order> findByArrivalTimeBetween(LocalDateTime startTime, LocalDateTime endTime);
    List<Order> findByCustomerId(String customerId);
    List<Order> findByRegular(boolean regular);
}
