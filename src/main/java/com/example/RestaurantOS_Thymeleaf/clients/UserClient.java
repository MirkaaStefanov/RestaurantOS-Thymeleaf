package com.example.RestaurantOS_Thymeleaf.clients;

import com.example.RestaurantOS_Thymeleaf.dtos.auth.PublicUserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "hm-users", url = "${backend.base-url}/users")
public interface UserClient {

    @GetMapping("/me")
    PublicUserDTO getMe(@RequestHeader("Authorization") String auth);

}
