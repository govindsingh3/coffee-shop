package com.coffeequeue.service;

import com.coffeequeue.model.Drink;
import org.springframework.stereotype.Service;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class MenuService {
    
    private final Map<String, Drink> menu = new LinkedHashMap<>();
    
    public MenuService() {
        initializeMenu();
    }
    
    private void initializeMenu() {
        menu.put("cold-brew", new Drink("Cold Brew", 1, 0.25, 120));
        menu.put("espresso", new Drink("Espresso", 2, 0.20, 150));
        menu.put("americano", new Drink("Americano", 2, 0.15, 140));
        menu.put("cappuccino", new Drink("Cappuccino", 4, 0.20, 180));
        menu.put("latte", new Drink("Latte", 4, 0.12, 200));
        menu.put("mocha", new Drink("Specialty (Mocha)", 6, 0.08, 250));
    }
    
    public Map<String, Drink> getMenu() {
        return new LinkedHashMap<>(menu);
    }
    
    public Drink getDrink(String drinkType) {
        return menu.get(drinkType);
    }
}
