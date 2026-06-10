package com.k2dev.smart_village.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
	
	private final SecretKey key;
    private long EXP;
    
    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-minutes}") long exp
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.EXP = exp;
    }

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
