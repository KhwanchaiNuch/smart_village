package com.k2dev.smart_village.entity;

public class RegisterRequest {
    private String username;
    private String password;
    private String fullName;
    private Integer provinceId;
    private Integer amphurId;
    private Integer tambonId;

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Integer getProvinceId() {
        return provinceId;
    }

    public void setProvinceId(Integer provinceId) {
        this.provinceId = provinceId;
    }

    public Integer getAmphurId() {
        return amphurId;
    }

    public void setAmphurId(Integer amphurId) {
        this.amphurId = amphurId;
    }

    public Integer getTambonId() {
        return tambonId;
    }

    public void setTambonId(Integer tambonId) {
        this.tambonId = tambonId;
    }
}
