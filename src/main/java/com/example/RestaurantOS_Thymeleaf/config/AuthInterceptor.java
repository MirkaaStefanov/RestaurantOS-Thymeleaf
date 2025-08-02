package com.example.RestaurantOS_Thymeleaf.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Get the JWT token from the session
        String token = (String) request.getSession().getAttribute("sessionToken");

        // Allow public access to login page, static resources, etc.
        String requestURI = request.getRequestURI();
        if (requestURI.equals("/auth/login") ||
                requestURI.startsWith("/login/google") ||
                requestURI.startsWith("/process-oauth2") ||
                requestURI.startsWith("/auth/register") ||
                requestURI.startsWith("/table/order/")) {
            return true;
        }

        // If no token is found, redirect to the login page
        if (token == null) {
            response.sendRedirect("/auth/login");
            return false; // Stop the request from proceeding
        }

        // Token exists, proceed with the request
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        // No action needed here for this use case
    }
}
