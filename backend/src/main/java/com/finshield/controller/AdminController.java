package com.finshield.controller;

import com.finshield.service.EodSchedulerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private EodSchedulerService eodSchedulerService;

    @PostMapping("/trigger-eod")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> triggerEodBatch() {
        try {
            eodSchedulerService.runEodAmortization();
            return ResponseEntity.ok("EOD Batch Job triggered successfully.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to trigger job: " + e.getMessage());
        }
    }
}
