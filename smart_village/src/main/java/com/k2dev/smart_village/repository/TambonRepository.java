
package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.Tambon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TambonRepository extends JpaRepository<Tambon, Integer> {
    List<Tambon> findByAmphurId(Integer amphurId);
}
