package com.example.RestaurantOS_Thymeleaf.controllers;


import com.example.RestaurantOS_Thymeleaf.clients.AuthenticationClient;
import com.example.RestaurantOS_Thymeleaf.dtos.auth.AuthenticationRequest;
import com.example.RestaurantOS_Thymeleaf.dtos.auth.AuthenticationResponse;
import com.example.RestaurantOS_Thymeleaf.dtos.auth.RegisterRequest;
import com.example.RestaurantOS_Thymeleaf.session.SessionManager;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/auth")
public class AuthenticationController {

    private final AuthenticationClient authenticationClient;
    private final SessionManager sessionManager;
    private static final String REDIRECTTXT = "redirect:/";


    @GetMapping("/register")
    public String register(Model model) {
        model.addAttribute("registerRequest", new RegisterRequest());
        return "register";
    }

    @PostMapping("/register")
    public ModelAndView register(RegisterRequest registerRequest, HttpServletRequest httpServletRequest) {

        ModelAndView modelAndView = new ModelAndView("redirect:/auth/register");

        try {
            ResponseEntity<AuthenticationResponse> authenticationResponse = authenticationClient.register(registerRequest);

            sessionManager.setSessionToken(httpServletRequest, authenticationResponse.getBody().getAccessToken(), authenticationResponse.getBody().getUser().getRole().toString());

            String redirectUrl = (String) httpServletRequest.getSession().getAttribute("redirectAfterLogin");
            if (redirectUrl != null) {
                httpServletRequest.getSession().removeAttribute("redirectAfterLogin");
                return new ModelAndView("redirect:" + redirectUrl);
            } else {
                return new ModelAndView(REDIRECTTXT);
            }

        } catch (Exception e) {
            modelAndView.addObject("error", "Невалидно име или парола");
            return modelAndView;
        }
    }

    @GetMapping("/login")
    public String login(Model model, AuthenticationRequest authenticationRequest, HttpServletRequest httpServletRequest) {
        String message = httpServletRequest.getParameter("message");
        if (message != null && message.equals("loginRequired")) {
            model.addAttribute("message", "Моля, впишете се, за да достъпите защитеното съдържание.");
        }

        String error = (String) httpServletRequest.getAttribute("error");
        if (error != null) {
            model.addAttribute("error", error);
        }

        model.addAttribute("loginRequest", new AuthenticationRequest());
        return "login";
    }

    @PostMapping("/login")
    public ModelAndView login(AuthenticationRequest authenticationRequest, HttpServletRequest httpServletRequest) {
        ModelAndView modelAndView = new ModelAndView("login");

        try {
            ResponseEntity<AuthenticationResponse> authenticationResponse = authenticationClient.authenticate(authenticationRequest);

            sessionManager.setSessionToken(httpServletRequest, authenticationResponse.getBody().getAccessToken(), authenticationResponse.getBody().getUser().getRole().toString());

            String redirectUrl = (String) httpServletRequest.getSession().getAttribute("redirectAfterLogin");
            if (redirectUrl != null) {
                httpServletRequest.getSession().removeAttribute("redirectAfterLogin");
                return new ModelAndView("redirect:" + redirectUrl);
            } else {
                return new ModelAndView(REDIRECTTXT);
            }

        } catch (Exception e) {
            // Add the error message
            modelAndView.addObject("error", "Невалидно име или парола");

            // *** CRUCIAL FIX: Add the authenticationRequest object back to the model ***
            // This ensures th:object="${loginRequest}" can find the object it needs.
            // It also has the benefit of pre-filling the email field with what the user typed.
            modelAndView.addObject("loginRequest", authenticationRequest); // <--- ADD THIS LINE

            return modelAndView;
        }
    }

    @GetMapping("/logout")
    public ModelAndView logout(HttpServletRequest request) {
        String token = (String) request.getSession().getAttribute("sessionToken");
        authenticationClient.logout(token);
        sessionManager.invalidateSession(request);
        return new ModelAndView(REDIRECTTXT);
    }


}
