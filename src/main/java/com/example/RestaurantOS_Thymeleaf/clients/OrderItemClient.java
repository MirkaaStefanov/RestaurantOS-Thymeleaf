package com.example.RestaurantOS_Thymeleaf.clients;

import com.example.RestaurantOS_Thymeleaf.dtos.OrderItemDTO;
import com.example.RestaurantOS_Thymeleaf.enums.OrderItemStatus;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "hm-order-items", url = "${backend.base-url}/order-items")
public interface OrderItemClient {

    @GetMapping
    List<OrderItemDTO> getAllOrderItems(
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) OrderItemStatus status,
            @RequestHeader(value = "Authorization", required = false) String auth);


    @GetMapping("/{id}")
    OrderItemDTO getById(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String auth);

    @PostMapping
    OrderItemDTO create(@RequestBody OrderItemDTO dto, @RequestHeader(value = "Authorization", required = false) String auth);

    @PatchMapping("/{id}")
    void update(@PathVariable Long id, @RequestBody OrderItemDTO dto, @RequestHeader(value = "Authorization", required = false) String auth);

    @DeleteMapping("/{id}")
    void delete(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String auth);

    @PostMapping("/accept/{id}")
    OrderItemDTO accept(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String auth);


}
