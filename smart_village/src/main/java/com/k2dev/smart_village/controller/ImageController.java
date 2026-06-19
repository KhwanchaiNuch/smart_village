package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.config.UploadProperties;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/image")
public class ImageController {

    @Autowired
    private UploadProperties uploadProperties;

    /**
     * GET /api/image/avatars/xxx.jpg
     * returns { "dataUrl": "data:image/jpeg;base64,..." }
     */
    @GetMapping("/**")
    public ResponseEntity<?> getImage(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String prefix = request.getContextPath() + "/api/image/";
        if (!uri.startsWith(prefix)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid path"));
        }
        String relativePath = uri.substring(prefix.length());

        if (relativePath.contains("..")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid path"));
        }

        Path filePath = uploadProperties.resolve(relativePath);

        if (!filePath.startsWith(uploadProperties.root())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Access denied"));
        }

        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        try {
            byte[] bytes = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "image/jpeg";
            String dataUrl = "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(bytes);
            return ResponseEntity.ok(Map.of("dataUrl", dataUrl));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "อ่านไฟล์ไม่สำเร็จ: " + e.getMessage()));
        }
    }
}
