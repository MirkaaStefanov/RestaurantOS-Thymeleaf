package com.example.RestaurantOS_Thymeleaf.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum OrderItemStatus {

    WAITING("За одобрение"),
    PENDING("Изчаква"),
    PREPARING("Приготвя се"),
    DONE("Готово");

    private final String displayName;

}
