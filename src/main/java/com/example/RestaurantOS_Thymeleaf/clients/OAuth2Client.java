package com.example.RestaurantOS_Thymeleaf.clients;

import com.example.RestaurantOS_Thymeleaf.dtos.auth.AuthenticationResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "restaurant-oauth2", url = "${backend.base-url}/oauth2")
public interface OAuth2Client {

    @GetMapping("/url/google")
    String auth();

    @GetMapping("/authenticate/google")
    ResponseEntity<AuthenticationResponse> googleAuthenticate(@RequestParam("code") String code);

}
