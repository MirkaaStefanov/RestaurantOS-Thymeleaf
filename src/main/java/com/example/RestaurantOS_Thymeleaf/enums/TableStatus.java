package com.example.RestaurantOS_Thymeleaf.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum TableStatus {

    AVAILABLE("Налична"),
    OCCUPIED("Заета"),
    RESERVED("Резервирана"),
    NEEDS_CLEANING("За почистване");

    private final String displayName;
}
