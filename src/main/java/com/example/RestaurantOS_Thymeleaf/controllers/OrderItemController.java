package com.example.RestaurantOS_Thymeleaf.controllers;

import com.example.RestaurantOS_Thymeleaf.clients.OrderItemClient;
import com.example.RestaurantOS_Thymeleaf.dtos.OrderItemDTO;
import com.example.RestaurantOS_Thymeleaf.enums.MenuCategory;
import com.example.RestaurantOS_Thymeleaf.enums.OrderItemStatus;
import com.example.RestaurantOS_Thymeleaf.enums.Role;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
@Slf4j
public class OrderItemController {

    private final OrderItemClient orderItemClient;

    @GetMapping("/kitchen")
    public String kitchenOrders(Model model, HttpServletRequest request) {

        String token = (String) request.getSession().getAttribute("sessionToken");
        String userRole = (String) request.getSession().getAttribute("sessionRole");

        if (userRole == null || !userRole.equals("COOKER")) {
            return "forward:/error";
        }

        List<OrderItemDTO> orderItems = orderItemClient.getAllOrderItems(null, OrderItemStatus.PREPARING, token);

        List<OrderItemDTO> filteredOrderItems = orderItems.stream()
                .filter(item -> item.getMenuItem() != null && item.getMenuItem().getCategory() != MenuCategory.BEVERAGE)
                .collect(Collectors.toList());

        filteredOrderItems.sort(Comparator.comparing(OrderItemDTO::getAddedTime));

        model.addAttribute("orderItems", filteredOrderItems);
        model.addAttribute("orderItemStatusEnumValues", OrderItemStatus.values());
        model.addAttribute("menuCategoryEnumValues", MenuCategory.values());
        return "kitchen/kitchen";

    }
}
