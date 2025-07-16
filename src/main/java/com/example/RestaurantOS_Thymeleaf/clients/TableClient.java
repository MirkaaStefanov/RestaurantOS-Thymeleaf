package com.example.RestaurantOS_Thymeleaf.clients;

import com.example.RestaurantOS_Thymeleaf.dtos.OrderDTO;
import com.example.RestaurantOS_Thymeleaf.dtos.TableDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "hm-tables", url = "${backend.base-url}/tables")
public interface TableClient {

    @GetMapping
    List<TableDTO> getAll(@RequestHeader(value = "Authorization", required = false) String auth);

    @GetMapping("/waiter")
    List<TableDTO> findForWaiter(@RequestHeader(value = "Authorization", required = true) String auth);

    @GetMapping("/{id}")
    TableDTO getById(@PathVariable UUID id, @RequestHeader(value = "Authorization", required = false) String auth);

    @PostMapping
    TableDTO create(@RequestBody TableDTO dto, @RequestHeader(value = "Authorization", required = true) String auth);

    @PutMapping("/{id}")
    TableDTO update(@PathVariable UUID id, @RequestBody TableDTO dto, @RequestHeader(value = "Authorization", required = true) String auth);

    @DeleteMapping("/{id}")
    void delete(@PathVariable UUID id, @RequestHeader(value = "Authorization", required = true) String auth);

    @PostMapping("/use/{id}")
    OrderDTO use(@PathVariable UUID id, @RequestHeader(value = "Authorization", required = false) String auth);

    @GetMapping("/order/{id}")
    OrderDTO getOrderForTable(@PathVariable UUID id, @RequestHeader(value = "Authorization", required = false) String auth);

}
