package com.finshield.service;

import com.finshield.model.CreditBureauCache;
import com.finshield.repository.CreditBureauCacheRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@Service
public class CreditBureauService {

    private static final Logger logger = LoggerFactory.getLogger(CreditBureauService.class);

    @Autowired
    private CreditBureauCacheRepository cacheRepository;

    @Autowired
    private RestTemplate restTemplate;

    public Integer fetchCreditScore(String email) {
        logger.info("Calling external credit bureau for email: {}", email);
        
        try {
            // Using localhost:8080 to call the mock controller for demo purposes
            String url = "http://localhost:8080/mock/credit-bureau/" + email;
            Integer score = restTemplate.getForObject(url, Integer.class);
            
            if (score != null) {
                // Cache the successful result
                Optional<CreditBureauCache> existingCache = cacheRepository.findByApplicantEmail(email);
                CreditBureauCache cache = existingCache.orElse(new CreditBureauCache());
                cache.setApplicantEmail(email);
                cache.setCreditScore(score);
                cacheRepository.save(cache);
                return score;
            }
        } catch (ResourceAccessException e) {
            logger.warn("External credit bureau call failed or timed out: {}. Falling back to cache for email: {}", e.getMessage(), email);
            return fallbackCreditScore(email);
        } catch (Exception e) {
            logger.warn("Unexpected error calling credit bureau: {}. Falling back to cache for email: {}", e.getMessage(), email);
            return fallbackCreditScore(email);
        }

        return fallbackCreditScore(email);
    }

    private Integer fallbackCreditScore(String email) {
        Optional<CreditBureauCache> cachedScore = cacheRepository.findByApplicantEmail(email);
        if (cachedScore.isPresent()) {
            logger.info("Returning cached credit score: {}", cachedScore.get().getCreditScore());
            return cachedScore.get().getCreditScore();
        }
        
        logger.warn("No cached credit score found for email: {}", email);
        return null; // Signals that we don't have a score, potentially triggering MANUAL_REVIEW
    }
}
