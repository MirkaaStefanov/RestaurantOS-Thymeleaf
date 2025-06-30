package com.example.RestaurantOS_Thymeleaf.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "restaurant-exchange", url = "${backend.base-url}/exchange")
public interface ExchangeClient {

    @GetMapping("/try")
    Double exchangeEuroToTRY();

}
