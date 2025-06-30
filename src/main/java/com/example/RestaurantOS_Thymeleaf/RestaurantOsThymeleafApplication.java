package com.example.RestaurantOS_Thymeleaf;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class RestaurantOsThymeleafApplication {

	public static void main(String[] args) {
		SpringApplication.run(RestaurantOsThymeleafApplication.class, args);
	}

}
