package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.PersonSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PersonSkillRepository extends JpaRepository<PersonSkill, Integer> {
    List<PersonSkill> findByPersonId(Integer personId);
}
