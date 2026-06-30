package com.finshield.repository;

import com.finshield.model.LoanLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LoanLedgerRepository extends JpaRepository<LoanLedger, UUID> {
    List<LoanLedger> findByLoanIdOrderByCreatedAtDesc(UUID loanId);
}
