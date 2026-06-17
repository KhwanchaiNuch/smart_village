package com.k2dev.smart_village.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final String UPLOAD_DIR = "./uploads/";

    @DeleteMapping("/{filename}")
    public ResponseEntity<?> delete(@PathVariable String filename) {
        try {
            // ป้องกัน path traversal
            Path uploadDir = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
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
            // สร้างโฟลเดอร์ถ้ายังไม่มี
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // ตั้งชื่อไฟล์ให้ unique ด้วย UUID
            String originalName = file.getOriginalFilename();
            String ext = "";
            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
            }
            String filename = UUID.randomUUID().toString() + ext;

            // บันทึกไฟล์
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // สร้าง URL กลับไป (ใช้ base จาก request จริง)
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
