package com.finshield.underwriting;

import com.finshield.dto.request.LoanApplicationRequest;
import com.finshield.model.LoanApplication;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class CreditScoreRule implements UnderwritingRule {
    @Override
    public RuleResult evaluate(LoanApplicationRequest application) {
        int score = application.getCreditScore();
        
        if (score < 650) {
            return new RuleResult(false, LoanApplication.Status.REJECTED, "Credit score below minimum requirement (650)", -30);
        } else if (score <= 700) {
            return new RuleResult(false, LoanApplication.Status.MANUAL_REVIEW, "Credit score is borderline, requires manual review", -10);
        } else {
            return new RuleResult(true, LoanApplication.Status.APPROVED, "Credit score is acceptable", 20);
        }
    }
}
