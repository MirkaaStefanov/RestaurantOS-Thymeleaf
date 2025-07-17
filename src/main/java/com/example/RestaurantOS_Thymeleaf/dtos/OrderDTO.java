package com.example.RestaurantOS_Thymeleaf.dtos;

import com.example.RestaurantOS_Thymeleaf.dtos.auth.PublicUserDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {

    public Long id;
    private List<OrderItemDTO> items;
    private double totalAmount;
    private PublicUserDTO user;
    private LocalDateTime orderTime;
    private LocalDateTime estimatedReadyTime;
    private TableDTO table;

}
