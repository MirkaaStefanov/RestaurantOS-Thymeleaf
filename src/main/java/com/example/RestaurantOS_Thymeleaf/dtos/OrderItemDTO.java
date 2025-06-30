package com.example.RestaurantOS_Thymeleaf.dtos;

import com.example.RestaurantOS_Thymeleaf.enums.OrderItemStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemDTO {

    public Long id;
    private Long menuItem;
    private String name;
    private double price;
    private int quantity;
    private String specialInstructions;
    private OrderItemStatus orderItemStatus;
    private Long order;

}
