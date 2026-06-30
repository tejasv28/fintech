package com.finshield.repository;

import com.finshield.model.LoanApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoanApplicationRepository extends JpaRepository<LoanApplication, UUID>, JpaSpecificationExecutor<LoanApplication> {
    List<LoanApplication> findByApplicantId(UUID applicantId);
    List<LoanApplication> findByAssignedOfficerId(UUID officerId);
    Optional<LoanApplication> findByIdempotencyKey(String idempotencyKey);
    long countByStatus(LoanApplication.Status status);
}
