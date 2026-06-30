package com.finshield.service;

import com.finshield.dto.response.DashboardStatsResponse;
import com.finshield.model.ActiveLoan;
import com.finshield.model.LoanApplication;
import com.finshield.repository.ActiveLoanRepository;
import com.finshield.repository.LoanApplicationRepository;
import com.finshield.dto.response.OfficerPerformanceResponse;
import com.finshield.repository.UserRepository;
import com.finshield.model.User;
import com.finshield.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private LoanApplicationRepository applicationRepository;

    @Autowired
    private ActiveLoanRepository activeLoanRepository;

    @Autowired
    private UserRepository userRepository;

    public DashboardStatsResponse getAdminStats() {
        long totalApps = applicationRepository.count();
        long approved = applicationRepository.countByStatus(LoanApplication.Status.APPROVED);
        long rejected = applicationRepository.countByStatus(LoanApplication.Status.REJECTED);
        long activeLoans = activeLoanRepository.count();

        Map<String, Long> statusCounts = new HashMap<>();
        statusCounts.put("PENDING", applicationRepository.countByStatus(LoanApplication.Status.PENDING));
        statusCounts.put("UNDER_REVIEW", applicationRepository.countByStatus(LoanApplication.Status.UNDER_REVIEW));
        statusCounts.put("APPROVED", approved);
        statusCounts.put("REJECTED", rejected);
        statusCounts.put("MANUAL_REVIEW", applicationRepository.countByStatus(LoanApplication.Status.MANUAL_REVIEW));

        // Mock loan volume for 6 months
        Map<String, BigDecimal> volume = new HashMap<>();
        volume.put("Jan", new BigDecimal("1500000"));
        volume.put("Feb", new BigDecimal("2000000"));
        volume.put("Mar", new BigDecimal("1800000"));
        volume.put("Apr", new BigDecimal("2500000"));
        volume.put("May", new BigDecimal("3000000"));
        volume.put("Jun", new BigDecimal("2800000"));

        return DashboardStatsResponse.builder()
                .totalApplications(totalApps)
                .approvedThisMonth(approved) // Simplified to total
                .rejectedThisMonth(rejected) // Simplified to total
                .totalActiveLoans(activeLoans)
                .applicationsByStatus(statusCounts)
                .loanVolumeOverTime(volume)
                .build();
    }

    public DashboardStatsResponse getOfficerStats() {
        long inQueue = applicationRepository.countByStatus(LoanApplication.Status.PENDING);
        long manualReview = applicationRepository.countByStatus(LoanApplication.Status.MANUAL_REVIEW);
        
        long totalApps = applicationRepository.count();
        long approved = applicationRepository.countByStatus(LoanApplication.Status.APPROVED);
        double rate = totalApps > 0 ? (double) approved / totalApps * 100 : 0.0;

        return DashboardStatsResponse.builder()
                .applicationsInQueue(inQueue)
                .reviewedToday(5L) // Mocked
                .pendingManualReview(manualReview)
                .approvalRate(Math.round(rate * 10.0) / 10.0)
                .build();
    }

    public DashboardStatsResponse getApplicantStats() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<LoanApplication> apps = applicationRepository.findByApplicantId(userDetails.getId());
        List<ActiveLoan> loans = activeLoanRepository.findByApplicantId(userDetails.getId());

        long submitted = apps.size();
        long approved = apps.stream().filter(a -> a.getStatus() == LoanApplication.Status.APPROVED).count();
        
        BigDecimal balance = loans.stream()
                .map(ActiveLoan::getOutstandingBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String nextEmi = loans.stream()
                .map(ActiveLoan::getNextDueDate)
                .min(LocalDate::compareTo)
                .map(d -> d.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")))
                .orElse("N/A");

        return DashboardStatsResponse.builder()
                .applicationsSubmitted(submitted)
                .approvedLoans(approved)
                .outstandingBalance(balance)
                .nextEmiDue(nextEmi)
                .build();
    }

    public List<OfficerPerformanceResponse> getOfficerPerformance() {
        List<User> officers = userRepository.findByRole(User.Role.LOAN_OFFICER);
        return officers.stream().map(officer -> {
            List<LoanApplication> apps = applicationRepository.findByAssignedOfficerId(officer.getId());
            long total = apps.size();
            long approved = apps.stream().filter(a -> a.getStatus() == LoanApplication.Status.APPROVED).count();
            long rejected = apps.stream().filter(a -> a.getStatus() == LoanApplication.Status.REJECTED).count();
            double rate = total > 0 ? (double) approved / total * 100 : 0.0;
            
            return OfficerPerformanceResponse.builder()
                    .officerId(officer.getId())
                    .officerName(officer.getFullName())
                    .totalApplicationsProcessed(total)
                    .approvedApplications(approved)
                    .rejectedApplications(rejected)
                    .approvalRate(Math.round(rate * 10.0) / 10.0)
                    .build();
        }).toList();
    }
}
