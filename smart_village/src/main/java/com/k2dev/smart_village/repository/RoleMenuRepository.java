package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.RoleMenu;
import com.k2dev.smart_village.entity.RoleMenuId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface RoleMenuRepository extends JpaRepository<RoleMenu, RoleMenuId> {
    List<RoleMenu> findByIdRoleId(Long roleId);
    List<RoleMenu> findByIdMenuId(Long menuId);

    @Modifying
    @Transactional
    @Query("DELETE FROM RoleMenu rm WHERE rm.id.roleId = :roleId")
    void deleteByRoleId(Long roleId);
}
