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
        // Hardcoded users for MVP
        users.put("barista", User.withUsername("barista")
                .password("{noop}password")
                .roles("BARISTA")
                .build());
        users.put("customer", User.withUsername("customer")
                .password("{noop}password")
                .roles("USER")
                .build());
        users.put("vip", User.withUsername("vip")
                .password("{noop}password")
                .roles("VIP")
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
