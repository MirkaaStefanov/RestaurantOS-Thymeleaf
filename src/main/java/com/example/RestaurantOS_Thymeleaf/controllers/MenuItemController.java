package com.example.RestaurantOS_Thymeleaf.controllers;


import com.example.RestaurantOS_Thymeleaf.clients.MenuItemClient;
import com.example.RestaurantOS_Thymeleaf.dtos.MenuItemDTO;
import com.example.RestaurantOS_Thymeleaf.enums.MenuCategory;
import feign.FeignException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Controller
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/menu-item")
public class MenuItemController {
    private final MenuItemClient menuItemClient;


    @GetMapping
    public String getMenuItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean available,
            Model model,
            HttpServletRequest request) {

        String token = (String) request.getSession().getAttribute("sessionToken");
        String userRole = (String) request.getSession().getAttribute("sessionRole");

        if (userRole == null || !userRole.equals("ADMIN") ) {
            return "forward:/error";
        }


        List<MenuItemDTO> menuItems = new ArrayList<>();

        try {
            // Fetch ALL menu items, filtering will happen on frontend
            menuItems = menuItemClient.getAllMenuItems(null, null, token);
            model.addAttribute("allMenuItems", menuItems);
        } catch (Exception e) {
            log.error("Error fetching all menu items: {}", e.getMessage());
            model.addAttribute("errorMessage", "Error loading menu items: " + e.getMessage());
            model.addAttribute("allMenuItems", List.of()); // Provide empty list on error
        }

        // Add categories for the filter buttons and modal dropdown
        model.addAttribute("menuCategoryEnumValues", MenuCategory.values());

        model.addAttribute("createDTO", new MenuItemDTO());
        model.addAttribute("updateDTO", new MenuItemDTO());

        log.info("Loaded total menu items: {}", menuItems.size());
        return "menu-item/list";
    }


    @PostMapping
    public String createMenuItem(
            @ModelAttribute MenuItemDTO menuItemDTO,// Matches form input name
            HttpServletRequest request,
            RedirectAttributes redirectAttributes) {

        String token = (String) request.getSession().getAttribute("sessionToken");

        try {
            if (menuItemDTO.getImageFile() != null && !menuItemDTO.getImageFile().isEmpty()) {
                byte[] fileBytes = menuItemDTO.getImageFile().getBytes();
                String encodedImage = Base64.getEncoder().encodeToString(fileBytes);
                menuItemDTO.setImage(encodedImage);
            } else if (menuItemDTO.getImage() != null && !menuItemDTO.getImage().isEmpty()) {

            } else {
                menuItemDTO.setImage(null);
                menuItemDTO.setImageFile(null);
            }

            menuItemClient.create(menuItemDTO, token);
            redirectAttributes.addFlashAttribute("successMessage", "Menu item created successfully!");
        } catch (Exception e) {
            log.error("Error creating menu item: {}", e.getMessage(), e);
            redirectAttributes.addFlashAttribute("errorMessage", "Failed to create menu item: " + e.getMessage());
        }
        return "redirect:/menu-item";
    }

    @PostMapping("/edit/{id}")
    public String updateSubmit(@PathVariable Long id, @ModelAttribute MenuItemDTO menuItemDTO, HttpServletRequest request) throws IOException {
        String token = (String) request.getSession().getAttribute("sessionToken");

        MenuItemDTO existingMenuItem = menuItemClient.getById(id, token);

        if (menuItemDTO.getImageFile() != null && !menuItemDTO.getImageFile().isEmpty()) {
            byte[] fileBytes = menuItemDTO.getImageFile().getBytes();
            String encodedImage = Base64.getEncoder().encodeToString(fileBytes);
            menuItemDTO.setImage(encodedImage);
        } else {

            menuItemDTO.setImage(existingMenuItem.getImage());
        }

        menuItemClient.update(id, menuItemDTO, token);
        return "redirect:/menu-item";
    }


    // Handles fetching a single menu item for editing (via AJAX on frontend)
    // This is still needed for the JS to populate the edit modal without a full page reload.
    @GetMapping("/{id}")
    @ResponseBody
    public MenuItemDTO getMenuItemById(@PathVariable Long id, HttpServletRequest request) {
        String token = (String) request.getSession().getAttribute("sessionToken");
        return menuItemClient.getById(id, token);
    }

    // Handles deleting a menu item
    @PostMapping("/delete/{id}")
    public String deleteMenuItem(@PathVariable Long id, HttpServletRequest request, RedirectAttributes redirectAttributes) {
        String token = (String) request.getSession().getAttribute("sessionToken");
        try {
            menuItemClient.delete(id, token);
            redirectAttributes.addFlashAttribute("successMessage", "Menu item deleted successfully!");
        } catch (Exception e) {
            log.error("Error deleting menu item with ID {}: {}", id, e.getMessage(), e);
            redirectAttributes.addFlashAttribute("errorMessage", "Failed to delete menu item: " + e.getMessage());
        }
        return "redirect:/menu-item";
    }


    @PostMapping("/toggle/{id}")
    public String toggleAvailability(@PathVariable Long id, HttpServletRequest request, RedirectAttributes redirectAttributes) {
        String token = (String) request.getSession().getAttribute("sessionToken");
        try {
            menuItemClient.toggleAvailability(id, token);
            redirectAttributes.addFlashAttribute("successMessage", "Menu item availability toggled!");
        } catch (Exception e) {
            log.error("Error toggling availability for menu item ID {}: {}", id, e.getMessage(), e);
            redirectAttributes.addFlashAttribute("errorMessage", "Failed to toggle availability: " + e.getMessage());
        }
        return "redirect:/menu-item";
    }
}

