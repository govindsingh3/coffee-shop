package com.coffeequeue.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import com.coffeequeue.model.Order;
import com.coffeequeue.model.Barista;
import java.util.List;

@Data
@AllArgsConstructor
public class QueueResponse {
    private List<Order> waitingOrders;
    private List<Barista> baristas;
    private QueueStats stats;
}
