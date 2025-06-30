package com.example.RestaurantOS_Thymeleaf.dtos.auth;



import com.example.RestaurantOS_Thymeleaf.dtos.common.BaseDTO;
import com.example.RestaurantOS_Thymeleaf.enums.Provider;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;


@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class OAuth2UserInfoDTO extends BaseDTO {
    private String sub;
    private String name;
    private String given_name;
    private String family_name;
    private String picture;
    private String email;
    private boolean email_verified;
    private String locale;
    private Provider provider = Provider.LOCAL;
}