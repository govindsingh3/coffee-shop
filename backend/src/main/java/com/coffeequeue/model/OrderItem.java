package com.coffeequeue.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "drink_type")
    private String drinkType;
    
    @Column(name = "quantity")
    private int quantity;
    
    @Column(name = "prep_time")
    private Long prepTime;
    
    @Column(name = "price")
    private double price;
    
    @Column(name = "order_id", insertable = false, updatable = false)
    private String orderId;
    
    public OrderItem(String drinkType, int quantity, Long prepTime, double price) {
        this.drinkType = drinkType;
        this.quantity = quantity;
        this.prepTime = prepTime;
        this.price = price;
    }
}
