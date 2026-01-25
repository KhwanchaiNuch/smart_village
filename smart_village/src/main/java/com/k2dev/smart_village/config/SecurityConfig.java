package com.k2dev.smart_village.config;

import com.k2dev.smart_village.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // ✅ อนุญาต login แบบเจาะจง (ชัวร์สุด)
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/auth/login").permitAll()

                // ✅ อนุญาต auth + swagger (กันเคส servletPath/context-path เพี้ยน)
                .requestMatchers(
                    "/api/auth/**",
                    "/smart_village/api/auth/**",

                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/v3/api-docs.yaml",

                    "/smart_village/swagger-ui.html",
                    "/smart_village/swagger-ui/**",
                    "/smart_village/v3/api-docs/**",
                    "/smart_village/v3/api-docs.yaml"
                ).permitAll()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable()); // ✅ กัน 403/entrypoint แปลก ๆ

        return http.build();
    }

}
