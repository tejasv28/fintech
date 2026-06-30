package com.finshield.repository;

import com.finshield.model.ActiveLoan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActiveLoanRepository extends JpaRepository<ActiveLoan, UUID> {
    List<ActiveLoan> findByApplicantId(UUID applicantId);
    Page<ActiveLoan> findByApplicantId(UUID applicantId, Pageable pageable);
    List<ActiveLoan> findAllByLoanStatus(ActiveLoan.LoanStatus loanStatus);
}
