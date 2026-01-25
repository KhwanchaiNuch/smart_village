package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.AppUser;
import com.k2dev.smart_village.repository.AppUserRepository;
import com.k2dev.smart_village.security.JwtUtil;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository repo;
    private final JwtUtil jwt;

    public AuthController(AppUserRepository repo, JwtUtil jwt) {
        this.repo = repo;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    public Object login(@RequestBody AppUser req) {

        AppUser user = repo.findByUsername(req.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPasswordHash().equals(req.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
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
