package com.finshield.dto.request;

import com.finshield.model.LoanApplication;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LoanApplicationRequest {

    @NotNull
    @Min(1000)
    private BigDecimal loanAmount;

    @NotBlank
    private String loanPurpose;

    @NotNull
    @Min(0)
    private BigDecimal annualIncome;

    @NotNull
    private LoanApplication.EmploymentStatus employmentStatus;

    @NotNull
    private Integer creditScore; // Simplified for input, normally fetched from bureau

    @NotNull
    private BigDecimal debtToIncomeRatio;

    @NotNull
    @Min(1)
    private Integer loanTermMonths;
}
