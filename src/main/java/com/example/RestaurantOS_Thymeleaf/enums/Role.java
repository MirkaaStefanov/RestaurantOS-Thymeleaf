package com.example.RestaurantOS_Thymeleaf.enums;


import lombok.Getter;
import lombok.RequiredArgsConstructor;





@Getter
@RequiredArgsConstructor
public enum Role {

    USER,
    ADMIN,
    WAITER,
    COOKER,
    BARMAN

}

