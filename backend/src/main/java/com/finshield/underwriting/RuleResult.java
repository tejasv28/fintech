package com.finshield.underwriting;

import com.finshield.model.LoanApplication;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RuleResult {
    private boolean passed;
    private LoanApplication.Status recommendedStatus;
    private String reason;
    private int riskScoreImpact;
}
