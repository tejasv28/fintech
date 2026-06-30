package com.finshield.service;

import com.finshield.model.ActiveLoan;
import com.finshield.model.LoanLedger;
import com.finshield.repository.ActiveLoanRepository;
import com.finshield.repository.LoanLedgerRepository;
import com.finshield.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.finshield.dto.response.PagedResponse;

@Service
public class ActiveLoanService {

    @Autowired
    private ActiveLoanRepository activeLoanRepository;

    @Autowired
    private LoanLedgerRepository loanLedgerRepository;

    public PagedResponse<ActiveLoan> getMyLoans(Pageable pageable) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Page<ActiveLoan> page = activeLoanRepository.findByApplicantId(userDetails.getId(), pageable);
        return new PagedResponse<>(page);
    }

    public PagedResponse<ActiveLoan> getAllLoans(Pageable pageable) {
        Page<ActiveLoan> page = activeLoanRepository.findAll(pageable);
        return new PagedResponse<>(page);
    }

    @Transactional
    public ActiveLoan payEmi(UUID id) {
        ActiveLoan loan = activeLoanRepository.findById(id).orElseThrow();
        if (loan.getLoanStatus() == ActiveLoan.LoanStatus.CLOSED) {
            throw new RuntimeException("Loan is already closed");
        }
        
        BigDecimal emi = loan.getEmiAmount();
        BigDecimal newBalance = loan.getOutstandingBalance().subtract(emi);
        if (newBalance.compareTo(BigDecimal.ZERO) <= 0) {
            newBalance = BigDecimal.ZERO;
            loan.setLoanStatus(ActiveLoan.LoanStatus.CLOSED);
        }
        
        loan.setOutstandingBalance(newBalance);
        loan.setNextDueDate(loan.getNextDueDate().plusMonths(1));
        
        LoanLedger ledgerEntry = new LoanLedger();
        ledgerEntry.setLoan(loan);
        ledgerEntry.setTransactionType(LoanLedger.TransactionType.PAYMENT);
        ledgerEntry.setAmount(emi);
        ledgerEntry.setBalanceAfter(newBalance);
        loanLedgerRepository.save(ledgerEntry);
        
        return activeLoanRepository.save(loan);
    }

    public List<LoanLedger> getLoanLedger(UUID loanId) {
        return loanLedgerRepository.findByLoanIdOrderByCreatedAtDesc(loanId);
    }
}
