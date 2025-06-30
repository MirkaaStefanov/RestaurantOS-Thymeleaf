package com.example.RestaurantOS_Thymeleaf.clients;


import com.example.RestaurantOS_Thymeleaf.dtos.auth.AuthenticationRequest;
import com.example.RestaurantOS_Thymeleaf.dtos.auth.AuthenticationResponse;
import com.example.RestaurantOS_Thymeleaf.dtos.auth.RefreshTokenBodyDTO;
import com.example.RestaurantOS_Thymeleaf.dtos.auth.RegisterRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.io.IOException;

@FeignClient(name = "restaurant-authentication", url = "${backend.base-url}/auth")
public interface AuthenticationClient {

    @PostMapping("/register")
    ResponseEntity<AuthenticationResponse>  register(@RequestBody RegisterRequest request);

    @PostMapping("/authenticate")
    ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request);

    @PostMapping("/refresh-token")
    AuthenticationResponse refreshToken(@RequestBody RefreshTokenBodyDTO refreshTokenBody) throws IOException;

    @GetMapping("/logout")
    void logout(@RequestHeader("Authorization") String auth);

}
