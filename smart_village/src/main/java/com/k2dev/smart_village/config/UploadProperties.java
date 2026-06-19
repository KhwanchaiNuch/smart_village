package com.k2dev.smart_village.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Single source of truth สำหรับ upload directory
 * ทุก Service/Controller ที่ต้องการ path ให้ inject class นี้
 */
@Configuration
public class UploadProperties {

    @Value("${app.upload.dir:/opt/smart_village/uploads}")
    private String uploadDir;

    /** absolute root: /opt/smart_village/uploads */
    public Path root() {
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    /** absolute sub-path: /opt/smart_village/uploads/{sub} */
    public Path resolve(String sub) {
        return root().resolve(sub).normalize();
    }

    /** แปลง relative URL /uploads/xxx → absolute Path */
    public Path fromUrl(String url) {
        if (url == null) return null;
        // ตัด leading slash หรือ leading dot
        String rel = url.startsWith("/uploads/") ? url.substring("/uploads/".length())
                   : url.startsWith("./uploads/") ? url.substring("./uploads/".length())
                   : url;
        return root().resolve(rel).normalize();
    }
}
