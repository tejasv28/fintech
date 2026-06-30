package com.finshield.controller;

import com.finshield.dto.response.DashboardStatsResponse;
import com.finshield.dto.response.OfficerPerformanceResponse;
import com.finshield.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/admin-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardStatsResponse> getAdminStats() {
        return ResponseEntity.ok(dashboardService.getAdminStats());
    }

    @GetMapping("/officer-stats")
    @PreAuthorize("hasRole('LOAN_OFFICER')")
    public ResponseEntity<DashboardStatsResponse> getOfficerStats() {
        return ResponseEntity.ok(dashboardService.getOfficerStats());
    }

    @GetMapping("/applicant-stats")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<DashboardStatsResponse> getApplicantStats() {
        return ResponseEntity.ok(dashboardService.getApplicantStats());
    }

    @GetMapping("/officer-performance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OfficerPerformanceResponse>> getOfficerPerformance() {
        return ResponseEntity.ok(dashboardService.getOfficerPerformance());
    }
}
