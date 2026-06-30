package com.finshield.service;

import com.finshield.model.ActiveLoan;
import com.finshield.model.LoanLedger;
import com.finshield.repository.ActiveLoanRepository;
import com.finshield.repository.LoanLedgerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class EodSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(EodSchedulerService.class);

    @Autowired
    private ActiveLoanRepository activeLoanRepository;

    @Autowired
    private LoanLedgerRepository loanLedgerRepository;

    @Scheduled(cron = "0 0 0 * * *")
    public void runEodAmortization() {
        logger.info("Starting EOD Amortization Job");
        
        List<ActiveLoan> activeLoans = activeLoanRepository.findAllByLoanStatus(ActiveLoan.LoanStatus.ACTIVE);
        logger.info("Found {} active loans to process", activeLoans.size());

        for (ActiveLoan loan : activeLoans) {
            try {
                processLoan(loan);
            } catch (Exception e) {
                logger.error("Failed to process loan ID {}: {}", loan.getId(), e.getMessage());
                // In a real system, we might want to flag this loan or add it to a dead-letter queue.
                // For now, we continue to the next one to ensure one failure doesn't block the rest.
            }
        }
        
        logger.info("EOD Amortization Job completed");
    }

    @Transactional
    public void processLoan(ActiveLoan loan) {
        BigDecimal annualRate = loan.getInterestRate().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal dailyRate = annualRate.divide(BigDecimal.valueOf(365), 6, RoundingMode.HALF_UP);
        
        BigDecimal dailyInterest = loan.getOutstandingBalance()
                .multiply(dailyRate)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal newBalance = loan.getOutstandingBalance().add(dailyInterest);

        // Update Loan
        loan.setOutstandingBalance(newBalance);
        activeLoanRepository.save(loan);

        // Create Ledger Entry
        LoanLedger ledger = new LoanLedger();
        ledger.setLoan(loan);
        ledger.setTransactionType(LoanLedger.TransactionType.INTEREST_ACCRUAL);
        ledger.setAmount(dailyInterest);
        ledger.setBalanceAfter(newBalance);
        ledger.setDescription("Daily interest accrual of " + loan.getInterestRate() + "% annually.");
        
        loanLedgerRepository.save(ledger);
        
        logger.debug("Processed loan ID {}. Added interest: {}", loan.getId(), dailyInterest);
    }
}
