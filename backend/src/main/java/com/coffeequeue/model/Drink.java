package com.coffeequeue.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Drink {
    private String name;
    private int prepTime;        // minutes
    private double frequency;    // percentage (0-1)
    private int price;          // in rupees
}
