package com.finshield.underwriting;

import com.finshield.model.LoanApplication;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class RiskDecision {
    private LoanApplication.Status status;
    private int finalRiskScore;
    private String primaryReason;
    private List<RuleResult> ruleResults;
}
