package com.example.RestaurantOS_Thymeleaf.controllers;

import com.example.RestaurantOS_Thymeleaf.clients.OAuth2Client;
import com.example.RestaurantOS_Thymeleaf.dtos.auth.AuthenticationResponse;
import com.example.RestaurantOS_Thymeleaf.session.SessionManager;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;

@Controller
@RequiredArgsConstructor
@Slf4j
public class OAuth2Controller {
    private final OAuth2Client oAuth2Client;
    private final SessionManager sessionManager;
    private static final String REDIRECTTXT = "redirect:/";


    @GetMapping("/login/google")
    public RedirectView redirectToGoogleAuth() {
        String authUrl = oAuth2Client.auth();
        return new RedirectView(authUrl);
    }

    @GetMapping("/process-oauth2")
    public ModelAndView handleGoogleCallback(@RequestParam("code") String code, HttpServletRequest httpServletRequest) {
        ResponseEntity<AuthenticationResponse> response = oAuth2Client.googleAuthenticate(code);
        sessionManager.setSessionToken(httpServletRequest, response.getBody().getAccessToken(), response.getBody().getUser().getRole().toString());
        return new ModelAndView(REDIRECTTXT);
    }

}
