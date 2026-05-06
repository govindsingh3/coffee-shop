package com.coffeequeue;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CoffeeQueueApplication {

    public static void main(String[] args) {
        SpringApplication.run(CoffeeQueueApplication.class, args);
        System.out.println("🚀 Coffee Shop Queue Optimization System started!");
        System.out.println("📊 Queue optimization active - Priority scoring enabled");
    }
}
