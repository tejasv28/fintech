package com.finshield.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class DashboardStatsResponse {
    // Admin stats
    private Long totalApplications;
    private Long approvedThisMonth;
    private Long rejectedThisMonth;
    private Long totalActiveLoans;
    private Map<String, Long> applicationsByStatus;
    private Map<String, BigDecimal> loanVolumeOverTime; // Mocked for now

    // Officer stats
    private Long applicationsInQueue;
    private Long reviewedToday;
    private Long pendingManualReview;
    private Double approvalRate;

    // Applicant stats
    private Long applicationsSubmitted;
    private Long approvedLoans;
    private BigDecimal outstandingBalance;
    private String nextEmiDue;
}
