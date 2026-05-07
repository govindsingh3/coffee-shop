package com.coffeequeue.controller;

import com.coffeequeue.security.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth")
@Slf4j
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> loginRequest) {
        try {
            log.info("Login attempt for user: {}", loginRequest.get("username"));

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.get("username"), loginRequest.get("password")));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            // Extract the user's role
            String role = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_USER")
                    .replace("ROLE_", "");

            log.info("Login successful for user: {} with role: {}", authentication.getName(), role);
            return ResponseEntity.ok(Map.of(
                "token", jwt, 
                "username", authentication.getName(),
                "role", role
            ));
        } catch (Exception e) {
            log.error("Login failed for user: {} - Error: {}", loginRequest.get("username"), e.getMessage());
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials", "message", e.getMessage()));
        }
    }
}
