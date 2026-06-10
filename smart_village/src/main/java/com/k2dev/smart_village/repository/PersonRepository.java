
package com.k2dev.smart_village.repository;
import com.k2dev.smart_village.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonRepository extends JpaRepository<Person,Integer>{}
