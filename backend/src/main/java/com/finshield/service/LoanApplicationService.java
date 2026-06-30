package com.finshield.service;

import com.finshield.dto.request.LoanApplicationRequest;
import com.finshield.model.ActiveLoan;
import com.finshield.model.LoanApplication;
import com.finshield.model.User;
import com.finshield.repository.ActiveLoanRepository;
import com.finshield.repository.LoanApplicationRepository;
import com.finshield.repository.UserRepository;
import com.finshield.security.UserDetailsImpl;
import com.finshield.underwriting.RiskDecision;
import com.finshield.underwriting.RuleEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.finshield.dto.request.AddNoteRequest;
import com.finshield.dto.response.ApplicationEventResponse;
import com.finshield.dto.response.ApplicationNoteResponse;
import com.finshield.dto.response.PagedResponse;
import com.finshield.model.ApplicationEvent;
import com.finshield.model.ApplicationNote;
import com.finshield.repository.ApplicationNoteRepository;
import com.finshield.repository.ApplicationEventRepository;
import com.finshield.specification.LoanApplicationSpecification;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

@Service
public class LoanApplicationService {

    @Autowired
    private LoanApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActiveLoanRepository activeLoanRepository;

    @Autowired
    private RuleEngine ruleEngine;

    @Autowired
    private CreditBureauService creditBureauService;

    @Autowired
    private ApplicationEventService eventService;

    @Autowired
    private ApplicationEventRepository eventRepository;

    @Autowired
    private ApplicationNoteRepository noteRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public LoanApplication applyForLoan(LoanApplicationRequest request, String idempotencyKey) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User applicant = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Use requested score if provided, else fetch from bureau
        Integer creditScore = request.getCreditScore();
        if (creditScore == null) {
             creditScore = creditBureauService.fetchCreditScore(applicant.getEmail());
        }
        
        if (creditScore == null) {
             // Fallback scenario where bureau is down and no cache exists
             request.setCreditScore(0); // placeholder
        } else {
             request.setCreditScore(creditScore);
        }

        RiskDecision decision = ruleEngine.evaluate(request);

        LoanApplication application = new LoanApplication();
        application.setApplicant(applicant);
        application.setLoanAmount(request.getLoanAmount());
        application.setLoanPurpose(request.getLoanPurpose());
        application.setAnnualIncome(request.getAnnualIncome());
        application.setEmploymentStatus(request.getEmploymentStatus());
        application.setCreditScore(request.getCreditScore());
        application.setDebtToIncomeRatio(request.getDebtToIncomeRatio());
        application.setLoanTermMonths(request.getLoanTermMonths());
        
        if (creditScore == null) {
            application.setStatus(LoanApplication.Status.MANUAL_REVIEW);
            application.setRejectionReason("Credit score unavailable, requires manual review.");
        } else {
            application.setStatus(decision.getStatus());
            if (decision.getStatus() == LoanApplication.Status.REJECTED) {
                application.setRejectionReason(decision.getPrimaryReason());
            }
        }
        
        application.setRiskScore(new BigDecimal(decision.getFinalRiskScore()));
        application.setIdempotencyKey(idempotencyKey);

        try {
            application.setRuleResultsJson(objectMapper.writeValueAsString(decision.getRuleResults()));
        } catch (JsonProcessingException e) {
            // handle exception or log
        }

        LoanApplication savedApp = applicationRepository.save(application);
        eventService.logEvent(savedApp, ApplicationEvent.EventType.APPLICATION_SUBMITTED, "Application submitted by user.");

        // If auto-approved, create the active loan
        if (savedApp.getStatus() == LoanApplication.Status.APPROVED) {
            createActiveLoan(savedApp);
        }

        return savedApp;
    }

    public List<LoanApplication> getMyApplications() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return applicationRepository.findByApplicantId(userDetails.getId());
    }

    public List<LoanApplication> getAllApplications() {
        return applicationRepository.findAll();
    }

    public PagedResponse<LoanApplication> getApplications(Pageable pageable, String status, String search, BigDecimal minAmount, BigDecimal maxAmount, LocalDateTime startDate, LocalDateTime endDate) {
        Specification<LoanApplication> spec = LoanApplicationSpecification.getApplications(status, search, minAmount, maxAmount, startDate, endDate);
        Page<LoanApplication> page = applicationRepository.findAll(spec, pageable);
        return new PagedResponse<>(page);
    }

    public LoanApplication getApplication(UUID id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    @Transactional
    public LoanApplication approveApplication(UUID id) {
        LoanApplication app = getApplication(id);
        app.setStatus(LoanApplication.Status.APPROVED);
        LoanApplication savedApp = applicationRepository.save(app);
        eventService.logEvent(savedApp, ApplicationEvent.EventType.APPROVED, "Application approved.");
        createActiveLoan(savedApp);
        return savedApp;
    }

    @Transactional
    public LoanApplication rejectApplication(UUID id, String reason) {
        LoanApplication app = getApplication(id);
        app.setStatus(LoanApplication.Status.REJECTED);
        app.setRejectionReason(reason);
        LoanApplication savedApp = applicationRepository.save(app);
        eventService.logEvent(savedApp, ApplicationEvent.EventType.REJECTED, "Application rejected. Reason: " + reason);
        return savedApp;
    }
    
    @Transactional
    public LoanApplication reviewApplication(UUID id) {
        LoanApplication app = getApplication(id);
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User officer = userRepository.findById(userDetails.getId()).orElseThrow();
        app.setStatus(LoanApplication.Status.UNDER_REVIEW);
        app.setAssignedOfficer(officer);
        LoanApplication savedApp = applicationRepository.save(app);
        eventService.logEvent(savedApp, ApplicationEvent.EventType.TAKEN_FOR_REVIEW, "Application taken for review by " + officer.getFullName());
        return savedApp;
    }

    private void createActiveLoan(LoanApplication app) {
        ActiveLoan activeLoan = new ActiveLoan();
        activeLoan.setApplication(app);
        activeLoan.setApplicant(app.getApplicant());
        activeLoan.setPrincipalAmount(app.getLoanAmount());
        activeLoan.setOutstandingBalance(app.getLoanAmount());
        
        // Simplified interest rate based on risk score (higher risk = higher rate)
        // Base rate 5% + risk premium
        BigDecimal baseRate = new BigDecimal("5.0");
        BigDecimal riskPremium = new BigDecimal(100 - app.getRiskScore().intValue()).divide(new BigDecimal("10"));
        BigDecimal rate = baseRate.add(riskPremium);
        activeLoan.setInterestRate(rate);

        // Calculate simple EMI for demo purposes: (P + (P * R * T)) / (T * 12)
        BigDecimal interestPart = app.getLoanAmount().multiply(rate).multiply(new BigDecimal(app.getLoanTermMonths())).divide(new BigDecimal("1200"), 2, RoundingMode.HALF_UP);
        BigDecimal emi = app.getLoanAmount().add(interestPart).divide(new BigDecimal(app.getLoanTermMonths()), 2, RoundingMode.HALF_UP);
        activeLoan.setEmiAmount(emi);

        activeLoan.setNextDueDate(LocalDate.now().plusMonths(1));
        
        activeLoanRepository.save(activeLoan);
        eventService.logEvent(app, ApplicationEvent.EventType.ACTIVE_LOAN_CREATED, "Active loan created.");
    }

    public List<ApplicationEventResponse> getTimeline(UUID id) {
        return eventRepository.findByLoanApplicationIdOrderByCreatedAtAsc(id).stream()
                .map(event -> ApplicationEventResponse.builder()
                        .id(event.getId())
                        .eventType(event.getEventType().name())
                        .description(event.getDescription())
                        .createdAt(event.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public List<ApplicationNoteResponse> getNotes(UUID id) {
        return noteRepository.findByLoanApplicationIdOrderByCreatedAtAsc(id).stream()
                .map(note -> ApplicationNoteResponse.builder()
                        .id(note.getId())
                        .authorName(note.getAuthor().getFullName())
                        .content(note.getContent())
                        .createdAt(note.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationNoteResponse addNote(UUID id, AddNoteRequest request) {
        LoanApplication app = getApplication(id);
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User author = userRepository.findById(userDetails.getId()).orElseThrow();

        ApplicationNote note = new ApplicationNote();
        note.setLoanApplication(app);
        note.setAuthor(author);
        note.setContent(request.getContent());

        ApplicationNote savedNote = noteRepository.save(note);
        
        return ApplicationNoteResponse.builder()
                .id(savedNote.getId())
                .authorName(savedNote.getAuthor().getFullName())
                .content(savedNote.getContent())
                .createdAt(savedNote.getCreatedAt())
                .build();
    }
}
