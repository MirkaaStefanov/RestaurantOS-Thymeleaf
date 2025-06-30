package com.example.RestaurantOS_Thymeleaf.dtos;

import com.example.RestaurantOS_Thymeleaf.enums.MenuCategory;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuItemDTO {

    public Long id;
    private String name;
    private String description;
    private double price;
    private MenuCategory category;
    private boolean available = true;
    private Integer preparationTime;
    private String image;
    @JsonIgnore
    private transient MultipartFile imageFile;
}
