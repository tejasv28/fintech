package com.finshield.underwriting;

import com.finshield.dto.request.LoanApplicationRequest;
import com.finshield.model.LoanApplication;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(3)
public class EmploymentVerificationRule implements UnderwritingRule {
    @Override
    public RuleResult evaluate(LoanApplicationRequest application) {
        LoanApplication.EmploymentStatus status = application.getEmploymentStatus();
        
        if (status == LoanApplication.EmploymentStatus.UNEMPLOYED) {
            return new RuleResult(false, LoanApplication.Status.REJECTED, "Applicant is unemployed", -40);
        } else if (status == LoanApplication.EmploymentStatus.SELF_EMPLOYED) {
            return new RuleResult(false, LoanApplication.Status.MANUAL_REVIEW, "Self-employed applicants require manual verification", -5);
        } else {
            return new RuleResult(true, LoanApplication.Status.APPROVED, "Applicant is employed", 15);
        }
    }
}
