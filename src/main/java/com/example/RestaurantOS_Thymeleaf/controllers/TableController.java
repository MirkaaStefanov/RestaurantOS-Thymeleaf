package com.example.RestaurantOS_Thymeleaf.controllers;

import com.example.RestaurantOS_Thymeleaf.clients.AuthenticationClient;
import com.example.RestaurantOS_Thymeleaf.clients.MenuItemClient;
import com.example.RestaurantOS_Thymeleaf.clients.TableClient;
import com.example.RestaurantOS_Thymeleaf.clients.UserClient;
import com.example.RestaurantOS_Thymeleaf.dtos.MenuItemDTO;
import com.example.RestaurantOS_Thymeleaf.dtos.OrderDTO;
import com.example.RestaurantOS_Thymeleaf.dtos.TableDTO;
import com.example.RestaurantOS_Thymeleaf.dtos.auth.AuthenticationResponse;
import com.example.RestaurantOS_Thymeleaf.dtos.auth.PublicUserDTO;
import com.example.RestaurantOS_Thymeleaf.enums.MenuCategory;
import com.example.RestaurantOS_Thymeleaf.enums.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.servlet.server.Session;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/table")
public class TableController {

    private final TableClient tableClient;
    private final UserClient userClient;
    private final MenuItemClient menuItemClient;

    @GetMapping
    public String getTables(Model model, HttpServletRequest request) {

        String token = (String) request.getSession().getAttribute("sessionToken");
        List<TableDTO> tables = new ArrayList<>();
        PublicUserDTO user = userClient.getMe(token);

        tables = tableClient.getAll(token);

        if (user.getRole().equals(Role.WAITER)) {
            List<TableDTO> forWaiter = tableClient.findForWaiter(token);
            model.addAttribute("waiterTables", forWaiter);
        }


        model.addAttribute("tables", tables);


        model.addAttribute("createDTO", new TableDTO());
        model.addAttribute("updateDTO", new TableDTO());

        log.info("Loaded total tables: {}", tables.size());
        return "table/list";
    }


    @PostMapping
    public String createTable(
            @ModelAttribute TableDTO tableDTO,// Matches form input name
            HttpServletRequest request,
            RedirectAttributes redirectAttributes) {

        String token = (String) request.getSession().getAttribute("sessionToken");

        try {
            tableClient.create(tableDTO, token);
            redirectAttributes.addFlashAttribute("successMessage", "Table created successfully!");
        } catch (Exception e) {
            log.error("Error creating table: {}", e.getMessage(), e);
            redirectAttributes.addFlashAttribute("errorMessage", "Failed to create table: " + e.getMessage());
        }
        return "redirect:/table";
    }

    @PostMapping("/edit/{id}")
    public String updateSubmit(@PathVariable UUID id, @ModelAttribute TableDTO tableDTO, HttpServletRequest request) throws IOException {
        String token = (String) request.getSession().getAttribute("sessionToken");

        TableDTO existingTable = tableClient.getById(id, token);
        tableClient.update(id, tableDTO, token);
        return "redirect:/table";
    }

    @GetMapping("/{id}")
    @ResponseBody
    public TableDTO getTableById(@PathVariable UUID id, HttpServletRequest request) {
        String token = (String) request.getSession().getAttribute("sessionToken");
        return tableClient.getById(id, token);
    }

    // Handles deleting a menu item
    @PostMapping("/delete/{id}")
    public String deleteTable(@PathVariable UUID id, HttpServletRequest request, RedirectAttributes redirectAttributes) {
        String token = (String) request.getSession().getAttribute("sessionToken");
        try {
            tableClient.delete(id, token);
            redirectAttributes.addFlashAttribute("successMessage", "Table deleted successfully!");
        } catch (Exception e) {
            log.error("Error deleting table with ID {}: {}", id, e.getMessage(), e);
            redirectAttributes.addFlashAttribute("errorMessage", "Failed to delete table: " + e.getMessage());
        }
        return "redirect:/table";
    }


    @PostMapping("/use/{id}")
    public String useTable(@PathVariable UUID id, HttpServletRequest request, RedirectAttributes redirectAttributes) {
        String token = (String) request.getSession().getAttribute("sessionToken");
        OrderDTO order = new OrderDTO();
        try {
            order = tableClient.use(id, token);
            redirectAttributes.addFlashAttribute("successMessage", "Table got activated!");
        } catch (Exception e) {
            log.error("Error in table getting used {}: {}", id, e.getMessage(), e);
            redirectAttributes.addFlashAttribute("errorMessage", "Failed to toggle availability: " + e.getMessage());
        }
        return "redirect:/table";
    }

    @GetMapping("/order/{id}")
    public String orderForTable(@PathVariable UUID id, HttpServletRequest request, Model model) {
        String token = (String) request.getSession().getAttribute("sessionToken");
        OrderDTO orderDTO = tableClient.getOrderForTable(id, token);
        List<MenuItemDTO> allMenuItems = menuItemClient.getAllMenuItems(true,null, token);
        model.addAttribute("order", orderDTO);
        model.addAttribute("allMenuItems", allMenuItems);
        model.addAttribute("orderId", orderDTO.getId());
        model.addAttribute("menuCategoryEnumValues", MenuCategory.values());
        System.out.println("menu items: "+allMenuItems.size());
        return "table/orders";

    }
}
