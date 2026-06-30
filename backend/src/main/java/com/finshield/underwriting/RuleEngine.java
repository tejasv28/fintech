package com.finshield.underwriting;

import com.finshield.dto.request.LoanApplicationRequest;
import com.finshield.model.LoanApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RuleEngine {

    private final List<UnderwritingRule> rules;

    @Autowired
    public RuleEngine(List<UnderwritingRule> rules) {
        this.rules = rules;
    }

    public RiskDecision evaluate(LoanApplicationRequest applicationRequest) {
        int baseScore = 50; // Starting risk score
        List<RuleResult> results = new ArrayList<>();
        LoanApplication.Status finalStatus = LoanApplication.Status.APPROVED;
        String primaryReason = "All rules passed";

        for (UnderwritingRule rule : rules) {
            RuleResult result = rule.evaluate(applicationRequest);
            results.add(result);
            baseScore += result.getRiskScoreImpact();

            if (result.getRecommendedStatus() == LoanApplication.Status.REJECTED) {
                finalStatus = LoanApplication.Status.REJECTED;
                primaryReason = result.getReason();
                break; // Fast fail on rejection
            } else if (result.getRecommendedStatus() == LoanApplication.Status.MANUAL_REVIEW) {
                if (finalStatus != LoanApplication.Status.REJECTED) {
                    finalStatus = LoanApplication.Status.MANUAL_REVIEW;
                    primaryReason = result.getReason();
                }
            }
        }

        // Clamp risk score between 0 and 100
        int clampedScore = Math.max(0, Math.min(100, baseScore));
        
        return new RiskDecision(finalStatus, clampedScore, primaryReason, results);
    }
}
