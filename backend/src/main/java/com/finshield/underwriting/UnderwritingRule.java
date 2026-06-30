package com.finshield.underwriting;

import com.finshield.dto.request.LoanApplicationRequest;

@FunctionalInterface
public interface UnderwritingRule {
    RuleResult evaluate(LoanApplicationRequest application);
}
