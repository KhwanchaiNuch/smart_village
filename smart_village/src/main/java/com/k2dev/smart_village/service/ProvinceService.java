package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.Province;
import com.k2dev.smart_village.repository.ProvinceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ProvinceService {

    @Autowired private ProvinceRepository repo;

    public List<Province> list() {
        return repo.findAll();
    }

    public ResponseEntity<?> get(Integer id) {
        Province p = repo.findById(id).orElse(null);
        if (p == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        return ResponseEntity.ok(p);
    }

    public Province add(Province p) {
        return repo.save(p);
    }

    public Province edit(Province p) {
        return repo.save(p);
    }

    public void delete(Integer id) {
        repo.deleteById(id);
    }
}