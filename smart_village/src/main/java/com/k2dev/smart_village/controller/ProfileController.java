package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.service.ProfileService;
import com.k2dev.smart_village.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService service;

    public ProfileController(ProfileService service) {
        this.service = service;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserPrincipal principal) {
        return service.me(principal);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@AuthenticationPrincipal UserPrincipal principal,
                                      @RequestBody ProfileUpdateRequest req) {
        return service.updateMe(principal, req.getFullName());
    }

    @PostMapping("/me/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserPrincipal principal,
                                            @RequestBody PasswordChangeRequest req) {
        return service.changePassword(principal, req.getOldPassword(), req.getNewPassword());
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<?> uploadAvatar(@AuthenticationPrincipal UserPrincipal principal,
                                          @RequestParam("file") MultipartFile file) {
        return service.uploadAvatar(principal, file);
    }

    public static class ProfileUpdateRequest {
        private String fullName;
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
    }

    public static class PasswordChangeRequest {
        private String oldPassword;
        private String newPassword;
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
