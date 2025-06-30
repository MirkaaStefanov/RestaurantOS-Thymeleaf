package com.example.RestaurantOS_Thymeleaf.dtos.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationResponse implements Serializable {
    private String accessToken;
    private String refreshToken;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private PublicUserDTO user;
}
