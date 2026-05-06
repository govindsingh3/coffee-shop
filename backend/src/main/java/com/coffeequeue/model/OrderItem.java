package com.coffeequeue.model;

import lombok.Data;
import java.util.List;

@Data
public class OrderItem {
    private String drinkType;
    private int quantity;
    private Long prepTime;
    private double price;
    
    public OrderItem() {}
    
    public OrderItem(String drinkType, int quantity, Long prepTime, double price) {
        this.drinkType = drinkType;
        this.quantity = quantity;
        this.prepTime = prepTime;
        this.price = price;
    }
}
