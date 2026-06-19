package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.config.UploadProperties;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Autowired
    private UploadProperties uploadProperties;

    @DeleteMapping("/{filename}")
    public ResponseEntity<?> delete(@PathVariable String filename) {
        try {
            Path uploadDir = uploadProperties.root();
            Path filePath  = uploadDir.resolve(filename).normalize();
            if (!filePath.startsWith(uploadDir)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid filename"));
            }
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "ลบไม่สำเร็จ: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        try {
            Path uploadPath = uploadProperties.root();
            Files.createDirectories(uploadPath);

            String originalName = file.getOriginalFilename();
            String ext = "";
            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
            }
            String filename = UUID.randomUUID().toString() + ext;

            Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

            String baseUrl = request.getScheme() + "://"
                    + request.getServerName() + ":" + request.getServerPort()
                    + request.getContextPath();
            String url = baseUrl + "/uploads/" + filename;

            return ResponseEntity.ok(Map.of("url", url, "filename", filename));
        } catch (IOException e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "อัปโหลดไม่สำเร็จ: " + e.getMessage()));
        }
    }
}
