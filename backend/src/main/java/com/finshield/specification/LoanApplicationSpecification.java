package com.finshield.specification;

import com.finshield.model.LoanApplication;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class LoanApplicationSpecification {

    public static Specification<LoanApplication> getApplications(
            String status, String search, BigDecimal minAmount, BigDecimal maxAmount,
            LocalDateTime startDate, LocalDateTime endDate) {
        
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(status)) {
                try {
                    LoanApplication.Status appStatus = LoanApplication.Status.valueOf(status.toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("status"), appStatus));
                } catch (IllegalArgumentException e) {
                    // Invalid status, ignore
                }
            }

            if (StringUtils.hasText(search)) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate applicantNamePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.join("applicant").get("name")), searchPattern);
                Predicate applicantEmailPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.join("applicant").get("email")), searchPattern);
                predicates.add(criteriaBuilder.or(applicantNamePredicate, applicantEmailPredicate));
            }

            if (minAmount != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("loanAmount"), minAmount));
            }

            if (maxAmount != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("loanAmount"), maxAmount));
            }

            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }

            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
