package com.example.RestaurantOS_Thymeleaf.clients;


import com.example.RestaurantOS_Thymeleaf.dtos.MenuItemDTO;
import com.example.RestaurantOS_Thymeleaf.enums.MenuCategory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "restaurant-menu-items", url = "${backend.base-url}/menu-items")
public interface MenuItemClient {

    @GetMapping
    List<MenuItemDTO> getAllMenuItems(
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) MenuCategory category,
            @RequestHeader(value = "Authorization", required = false) String auth);

    @GetMapping("/{id}")
    MenuItemDTO getById(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String auth);

    @PostMapping
    MenuItemDTO create(@RequestBody MenuItemDTO dto, @RequestHeader(value = "Authorization", required = false) String auth);

    @PutMapping("/{id}")
    MenuItemDTO update(@PathVariable Long id, @RequestBody MenuItemDTO dto, @RequestHeader(value = "Authorization", required = false) String auth);


    @DeleteMapping("/{id}")
    void delete(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String auth);

    @PostMapping("/{id}/toggle")
    MenuItemDTO toggleAvailability(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String auth);


}
