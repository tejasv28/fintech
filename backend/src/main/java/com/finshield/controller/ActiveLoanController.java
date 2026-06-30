package com.finshield.controller;

import com.finshield.model.ActiveLoan;
import com.finshield.model.LoanLedger;
import com.finshield.service.ActiveLoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.finshield.dto.response.PagedResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/active-loans")
public class ActiveLoanController {

    @Autowired
    private ActiveLoanService activeLoanService;

    @GetMapping("/my-loans")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<PagedResponse<ActiveLoan>> getMyLoans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("nextDueDate").ascending());
        return ResponseEntity.ok(activeLoanService.getMyLoans(pageable));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LOAN_OFFICER')")
    public ResponseEntity<PagedResponse<ActiveLoan>> getAllLoans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("nextDueDate").ascending());
        return ResponseEntity.ok(activeLoanService.getAllLoans(pageable));
    }

    @PostMapping("/{id}/pay-emi")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<ActiveLoan> payEmi(@PathVariable UUID id) {
        return ResponseEntity.ok(activeLoanService.payEmi(id));
    }

    @GetMapping("/{id}/ledger")
    public ResponseEntity<List<LoanLedger>> getLoanLedger(@PathVariable UUID id) {
        return ResponseEntity.ok(activeLoanService.getLoanLedger(id));
    }
}
