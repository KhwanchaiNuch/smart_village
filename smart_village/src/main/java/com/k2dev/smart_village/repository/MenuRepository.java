package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    List<Menu> findByStatus(Boolean status);
    Optional<Menu> findByUrl(String url);
}
