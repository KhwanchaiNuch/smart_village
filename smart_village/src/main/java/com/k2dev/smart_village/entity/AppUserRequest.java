package com.k2dev.smart_village.entity;

/**
 * DTO สำหรับ create / update AppUser
 * password — กรอกตอน create (required), ตอน update ถ้าเว้นว่างจะไม่เปลี่ยน password
 */
public class AppUserRequest {

    private String username;
    private String password;      // plain-text, backend จะ bcrypt ก่อนบันทึก
    private String fullName;
    private String roleLevel;     // PROVINCE | AMPHUR | TAMBON | VILLAGE | ADMIN
    private Integer scopeId;
    private Boolean isActive;
    private Integer provinceId;
    private Integer amphurId;
    private Integer tambonId;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRoleLevel() { return roleLevel; }
    public void setRoleLevel(String roleLevel) { this.roleLevel = roleLevel; }

    public Integer getScopeId() { return scopeId; }
    public void setScopeId(Integer scopeId) { this.scopeId = scopeId; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getProvinceId() { return provinceId; }
    public void setProvinceId(Integer provinceId) { this.provinceId = provinceId; }

    public Integer getAmphurId() { return amphurId; }
    public void setAmphurId(Integer amphurId) { this.amphurId = amphurId; }

    public Integer getTambonId() { return tambonId; }
    public void setTambonId(Integer tambonId) { this.tambonId = tambonId; }
}
