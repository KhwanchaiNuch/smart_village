package com.k2dev.smart_village.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@SuppressWarnings("serial")
public class UserPrincipal implements UserDetails {

    private final String username;
    private final String role;
    private final Integer scopeId;

    public UserPrincipal(String username, String role, Integer scopeId) {
        this.username = username;
        this.role = role;
        this.scopeId = scopeId;
    }

    public String getRole() {
        return role;
    }

    public Integer getScopeId() {
        return scopeId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(() -> "ROLE_" + role);
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
