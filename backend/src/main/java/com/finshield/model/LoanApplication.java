package com.finshield.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "loan_applications")
public class LoanApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User applicant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_officer_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User assignedOfficer;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal loanAmount;

    @Column(length = 255)
    private String loanPurpose;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal annualIncome;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private EmploymentStatus employmentStatus;

    @Column(nullable = false)
    private Integer creditScore;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal debtToIncomeRatio;

    @Column(nullable = false)
    private Integer loanTermMonths;

    @Column(length = 30)
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    @Column(precision = 5, scale = 2)
    private BigDecimal riskScore;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(columnDefinition = "TEXT")
    private String ruleResultsJson;

    @Column(unique = true, length = 255)
    private String idempotencyKey;

    @Version
    private Integer version = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Status {
        PENDING,
        UNDER_REVIEW,
        APPROVED,
        REJECTED,
        MANUAL_REVIEW
    }

    public enum EmploymentStatus {
        EMPLOYED,
        SELF_EMPLOYED,
        UNEMPLOYED
    }
}
