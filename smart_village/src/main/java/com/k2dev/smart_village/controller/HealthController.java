package com.k2dev.smart_village.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
	@GetMapping("/api/health")
	public String health() {
		return "Smart Village Backend is running";
	}
}
