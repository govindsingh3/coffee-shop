package com.coffeequeue.service;

import com.coffeequeue.model.Order;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
@Slf4j
public class WhatsAppNotificationService {

    // These would normally be configured in application.properties or ENV variables
    private String twilioAccountSid = "AC_MOCK_ACCOUNT_SID";
    private String twilioAuthToken = "MOCK_AUTH_TOKEN";
    private String twilioWhatsAppNumber = "whatsapp:+14155238886"; // Twilio sandbox number

    private boolean isMockMode = true;

    @PostConstruct
    public void init() {
        if (!isMockMode) {
            Twilio.init(twilioAccountSid, twilioAuthToken);
        } else {
            log.info("📱 WhatsApp Notification Service initialized in MOCK MODE.");
        }
    }

    public void sendOrderConfirmation(Order order, String customerPhone) {
        String body = String.format("☕ Bean & Brew: Your order (ID: %s) has been received and is being prepared! You are currently #%d in the queue.", 
                order.getId().substring(0, 8), ((int) order.getPriorityScore()) % 10);
        sendMessage(customerPhone, body);
    }

    public void sendOrderReady(Order order, String customerPhone) {
        String body = String.format("🎉 Bean & Brew: Great news! Your order (ID: %s) is ready for pickup at the counter. Enjoy your coffee!", 
                order.getId().substring(0, 8));
        sendMessage(customerPhone, body);
    }

    private void sendMessage(String toPhoneNumber, String body) {
        if (toPhoneNumber == null || toPhoneNumber.isEmpty()) {
            return;
        }

        if (isMockMode) {
            log.info("======================================================");
            log.info("📱 MOCK WHATSAPP SENT TO: {}", toPhoneNumber);
            log.info("💬 MESSAGE: {}", body);
            log.info("======================================================");
            return;
        }

        try {
            Message message = Message.creator(
                    new PhoneNumber("whatsapp:" + toPhoneNumber),
                    new PhoneNumber(twilioWhatsAppNumber),
                    body)
                .create();
            log.info("✅ WhatsApp message sent successfully. SID: {}", message.getSid());
        } catch (Exception e) {
            log.error("❌ Failed to send WhatsApp message: {}", e.getMessage());
        }
    }
}
