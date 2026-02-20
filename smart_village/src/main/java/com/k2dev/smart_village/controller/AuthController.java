package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.AppUser;
import com.k2dev.smart_village.entity.LoginRequest;
import com.k2dev.smart_village.repository.AppUserRepository;
import com.k2dev.smart_village.security.JwtUtil;

import org.hibernate.exception.AuthException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	
    private final AppUserRepository repo;
    private final JwtUtil jwt;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AppUserRepository repo, JwtUtil jwt, PasswordEncoder passwordEncoder ) {
        this.repo = repo;
        this.jwt = jwt;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public Object login(@RequestBody LoginRequest req) {

        AppUser user = repo.findByUsername(req.getUsername())
                .orElseThrow(() -> new AuthException("User not found", null));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new AuthException("Invalid password", null);
        }

        String token = jwt.generateToken(
                user.getUsername(),
                user.getRoleLevel(),
                user.getScopeId()
        );

        return java.util.Map.of(
                "token", token,
                "role", user.getRoleLevel(),
                "scopeId", user.getScopeId()
        );
    }

}
