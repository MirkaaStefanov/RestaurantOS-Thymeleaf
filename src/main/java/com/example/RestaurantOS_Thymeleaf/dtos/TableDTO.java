package com.example.RestaurantOS_Thymeleaf.dtos;

import com.example.RestaurantOS_Thymeleaf.enums.TableStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TableDTO {

    public UUID id;
    private int number;
    private int capacity;
    private TableStatus status;
    private Long currentOrder;
    private UUID waiter;

}
