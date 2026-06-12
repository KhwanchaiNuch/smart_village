package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.VillageResource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VillageResourceRepository extends JpaRepository<VillageResource, Integer> {
    List<VillageResource> findByVillageCode(String villageCode);
    List<VillageResource> findByResourceType(String resourceType);
}
