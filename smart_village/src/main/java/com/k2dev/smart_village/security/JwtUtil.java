package com.k2dev.smart_village.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET =
            "SMART_VILLAGE_SECRET_KEY_256_BIT_LONG_ENOUGH_123456";

    private static final long EXP = 1000 * 60 * 60 * 8;

    private final SecretKey key =
            Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    public String generateToken(String username, String role, Integer scopeId) {
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .claim("scopeId", scopeId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXP))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        // ✅ API แนวใหม่: parser() -> verifyWith(key) -> build() -> parseSignedClaims()
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
