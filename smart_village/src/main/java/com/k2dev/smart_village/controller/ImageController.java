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
     * Default avatar: SVG user-circle icon encoded as data URL
     * ใช้เมื่อไฟล์ avatar ไม่มีอยู่บน disk (เช่น ถูกลบหรือ server เปลี่ยน)
     */
    private static final String DEFAULT_AVATAR_DATA_URL;
    static {
        String svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\">"
                + "<circle cx=\"50\" cy=\"50\" r=\"50\" fill=\"#e5e7eb\"/>"
                + "<circle cx=\"50\" cy=\"38\" r=\"18\" fill=\"#9ca3af\"/>"
                + "<ellipse cx=\"50\" cy=\"85\" rx=\"28\" ry=\"20\" fill=\"#9ca3af\"/>"
                + "</svg>";
        String b64 = Base64.getEncoder().encodeToString(svg.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        DEFAULT_AVATAR_DATA_URL = "data:image/svg+xml;base64," + b64;
    }

    /**
     * GET /api/image/avatars/xxx.jpg
     * returns { "dataUrl": "data:image/jpeg;base64,..." }
     */
    @GetMapping("/**")
    public ResponseEntity<?> getImage(HttpServletRequest request) {
        String uri = request.getRequestURI();
        // ปรับการตัด prefix ให้ตัดส่วนที่เป็น contextPath ออกด้วยเสมอ
        String contextPath = request.getContextPath(); // "/smart_village"
        String prefix = "/api/image/";
        
        String relativePath;
        if (uri.startsWith(contextPath + prefix)) {
            relativePath = uri.substring((contextPath + prefix).length());
        } else if (uri.startsWith(prefix)) {
            relativePath = uri.substring(prefix.length());
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid path"));
        }

        if (relativePath.contains("..")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid path"));
        }

        Path filePath = uploadProperties.resolve(relativePath);

        if (!filePath.startsWith(uploadProperties.root())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Access denied"));
        }

        if (!Files.exists(filePath)) {
            // ถ้าเป็น avatar path → คืน default avatar SVG แทน 404
            if (relativePath.startsWith("avatars/")) {
                return ResponseEntity.ok(Map.of("dataUrl", DEFAULT_AVATAR_DATA_URL));
            }
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
