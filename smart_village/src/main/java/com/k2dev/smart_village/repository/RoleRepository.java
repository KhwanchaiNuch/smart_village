package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    List<Role> findByStatus(Boolean status);
    boolean existsByName(String name);
    Optional<Role> findByName(String name);
}
