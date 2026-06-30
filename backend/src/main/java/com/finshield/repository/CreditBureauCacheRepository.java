package com.finshield.repository;

import com.finshield.model.CreditBureauCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CreditBureauCacheRepository extends JpaRepository<CreditBureauCache, UUID> {
    Optional<CreditBureauCache> findByApplicantEmail(String applicantEmail);
}
