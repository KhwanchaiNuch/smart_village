package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.AppUser;
import com.k2dev.smart_village.entity.LoginRequest;
import com.k2dev.smart_village.entity.RegisterRequest;
import com.k2dev.smart_village.repository.AppUserRepository;
import com.k2dev.smart_village.security.JwtUtil;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.hibernate.exception.AuthException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository repo;
    private final JwtUtil jwt;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AppUserRepository repo, JwtUtil jwt, PasswordEncoder passwordEncoder) {
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

        java.util.Map<String, Object> resp = new java.util.LinkedHashMap<>();
        resp.put("token",    token);
        resp.put("role",     user.getRoleLevel());
        resp.put("scopeId",  user.getScopeId());
        resp.put("username", user.getUsername());
        resp.put("fullName", user.getFullName());
        return resp;
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");

        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing token");
        }

        try {
            String oldToken = auth.substring(7);
            Claims claims = jwt.parseIgnoreExpiry(oldToken);
            String username = claims.getSubject();

            AppUser user = repo.findByUsername(username)
                    .orElseThrow(() -> new AuthException("User not found", null));

            if (!Boolean.TRUE.equals(user.getIsActive())) {
                return ResponseEntity.status(401).body("User inactive");
            }

            String newToken = jwt.generateToken(
                    user.getUsername(),
                    user.getRoleLevel(),
                    user.getScopeId()
            );

            java.util.Map<String, Object> resp = new java.util.LinkedHashMap<>();
            resp.put("token",    newToken);
            resp.put("role",     user.getRoleLevel());
            resp.put("scopeId",  user.getScopeId());
            resp.put("username", user.getUsername());
            resp.put("fullName", user.getFullName());
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.getUsername() == null || req.getUsername().isBlank() ||
            req.getPassword() == null || req.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "กรุณากรอก Username และ Password"));
        }

        if (repo.findByUsername(req.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Username นี้ถูกใช้งานแล้ว"));
        }

        AppUser user = new AppUser();
        user.setUsername(req.getUsername());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setFullName(req.getFullName());
        user.setRoleLevel("VIEWER"); // สมัครแบบผู้รับชม — ล็อคที่ Village A
        user.setScopeId(1);          // village_id = 1 (หมู่บ้าน A)
        user.setProvinceId(null);
        user.setAmphurId(null);
        user.setTambonId(null);
        user.setIsActive(true);

        repo.save(user);
        return ResponseEntity.ok(java.util.Map.of("message", "ลงทะเบียนเรียบร้อยแล้ว"));
    }
}
