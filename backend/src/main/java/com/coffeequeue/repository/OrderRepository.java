package com.coffeequeue.repository;

import com.coffeequeue.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByStatus(Order.OrderStatus status);
    List<Order> findByCustomerPhone(String customerPhone);
    List<Order> findByStatusOrderByPriorityScoreDesc(Order.OrderStatus status);
}
