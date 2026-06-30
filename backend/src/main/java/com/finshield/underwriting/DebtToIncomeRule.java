package com.finshield.underwriting;

import com.finshield.dto.request.LoanApplicationRequest;
import com.finshield.model.LoanApplication;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Order(2)
public class DebtToIncomeRule implements UnderwritingRule {
    @Override
    public RuleResult evaluate(LoanApplicationRequest application) {
        BigDecimal dti = application.getDebtToIncomeRatio();
        
        if (dti.compareTo(new BigDecimal("45.0")) > 0) {
            return new RuleResult(false, LoanApplication.Status.REJECTED, "Debt-to-Income ratio exceeds maximum limit (45%)", -30);
        } else if (dti.compareTo(new BigDecimal("35.0")) >= 0) {
            return new RuleResult(false, LoanApplication.Status.MANUAL_REVIEW, "Debt-to-Income ratio is high, requires manual review", -10);
        } else {
            return new RuleResult(true, LoanApplication.Status.APPROVED, "Debt-to-Income ratio is acceptable", 15);
        }
    }
}
