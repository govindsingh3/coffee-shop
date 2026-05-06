package com.coffeequeue.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
@Slf4j
@CrossOrigin(origins = "*")
public class PaymentController {

    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody Map<String, Object> paymentRequest) {
        log.info("💳 Processing simulated payment for amount: ${}", paymentRequest.get("amount"));
        
        // Simulate processing delay
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        String transactionId = "txn_" + UUID.randomUUID().toString().replace("-", "");
        
        log.info("✅ Payment successful! Transaction ID: {}", transactionId);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "transactionId", transactionId,
            "message", "Payment processed successfully via simulated gateway"
        ));
    }
}
