package com.finshield.controller;

import com.finshield.aop.Idempotent;
import com.finshield.dto.request.LoanApplicationRequest;
import com.finshield.dto.request.AddNoteRequest;
import com.finshield.dto.response.ApplicationEventResponse;
import com.finshield.dto.response.ApplicationNoteResponse;
import com.finshield.dto.response.PagedResponse;
import com.finshield.model.LoanApplication;
import com.finshield.service.LoanApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/loans")
public class LoanApplicationController {

    private final LoanApplicationService applicationService;

    public LoanApplicationController(LoanApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/apply")
    @PreAuthorize("hasRole('APPLICANT')")
    @Idempotent(headerName = "X-Idempotency-Key")
    public ResponseEntity<?> applyForLoan(
            @Valid @RequestBody LoanApplicationRequest request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey) {
        try {
            LoanApplication app = applicationService.applyForLoan(request, idempotencyKey);
            return ResponseEntity.ok(app);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<List<LoanApplication>> getMyApplications() {
        return ResponseEntity.ok(applicationService.getMyApplications());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LOAN_OFFICER')")
    public ResponseEntity<PagedResponse<LoanApplication>> getAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(applicationService.getApplications(pageable, status, search, minAmount, maxAmount, startDate, endDate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanApplication> getApplication(@PathVariable UUID id) {
        return ResponseEntity.ok(applicationService.getApplication(id));
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasRole('LOAN_OFFICER')")
    public ResponseEntity<LoanApplication> reviewApplication(@PathVariable UUID id) {
        return ResponseEntity.ok(applicationService.reviewApplication(id));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('LOAN_OFFICER')")
    public ResponseEntity<LoanApplication> approveApplication(@PathVariable UUID id) {
        return ResponseEntity.ok(applicationService.approveApplication(id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('LOAN_OFFICER')")
    public ResponseEntity<LoanApplication> rejectApplication(@PathVariable UUID id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(applicationService.rejectApplication(id, payload.get("reason")));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<ApplicationEventResponse>> getTimeline(@PathVariable UUID id) {
        return ResponseEntity.ok(applicationService.getTimeline(id));
    }

    @GetMapping("/{id}/notes")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LOAN_OFFICER')")
    public ResponseEntity<List<ApplicationNoteResponse>> getNotes(@PathVariable UUID id) {
        return ResponseEntity.ok(applicationService.getNotes(id));
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LOAN_OFFICER')")
    public ResponseEntity<ApplicationNoteResponse> addNote(@PathVariable UUID id, @Valid @RequestBody AddNoteRequest request) {
        return ResponseEntity.ok(applicationService.addNote(id, request));
    }
}
