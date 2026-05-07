package com.coffeequeue.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final Map<String, UserDetails> users = new HashMap<>();

    public UserDetailsServiceImpl() {
        // ═══════════════════════════════════════════
        // ADMIN — Full access: Dashboard, Analytics, QR, Menu, Queue
        // ═══════════════════════════════════════════
        users.put("admin", User.withUsername("admin")
                .password("{noop}admin123")
                .roles("ADMIN")
                .build());

        // ═══════════════════════════════════════════
        // BARISTAS — Queue access only: View/Complete orders, Print bills
        // ═══════════════════════════════════════════
        users.put("barista", User.withUsername("barista")
                .password("{noop}password")
                .roles("BARISTA")
                .build());

        users.put("barista2", User.withUsername("barista2")
                .password("{noop}password")
                .roles("BARISTA")
                .build());
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserDetails user = users.get(username);
        if (user == null) {
            throw new UsernameNotFoundException("User Not Found with username: " + username);
        }
        return user;
    }
}
