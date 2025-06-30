package com.example.RestaurantOS_Thymeleaf.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum OrderItemStatus {

    WAITING,
    PENDING,
    PREPARING,
    DONE

}
