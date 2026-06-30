package com.finshield.config;

import com.finshield.model.ActiveLoan;
import com.finshield.model.LoanApplication;
import com.finshield.model.User;
import com.finshield.repository.ActiveLoanRepository;
import com.finshield.repository.LoanApplicationRepository;
import com.finshield.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoanApplicationRepository applicationRepository;

    @Autowired
    private ActiveLoanRepository activeLoanRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Already initialized
        }

        // 1. Create Users
        User admin = createUser("Admin User", "admin@finshield.com", "Admin@123", User.Role.ADMIN);
        User officer = createUser("Loan Officer", "officer@finshield.com", "Officer@123", User.Role.LOAN_OFFICER);
        User app1 = createUser("John Doe", "john.doe@email.com", "John@123", User.Role.APPLICANT);
        User app2 = createUser("Jane Smith", "jane.smith@email.com", "Jane@123", User.Role.APPLICANT);

        // 2. Create sample applications
        createApplication(app1, officer, 50000, "Home Renovation", 120000, LoanApplication.EmploymentStatus.EMPLOYED, 750, 25.0, 36, LoanApplication.Status.APPROVED, 15);
        createApplication(app2, null, 10000, "Debt Consolidation", 40000, LoanApplication.EmploymentStatus.EMPLOYED, 600, 55.0, 24, LoanApplication.Status.REJECTED, 85);
        createApplication(app1, null, 25000, "Car Loan", 120000, LoanApplication.EmploymentStatus.EMPLOYED, 750, 25.0, 48, LoanApplication.Status.PENDING, 20);
        createApplication(app2, officer, 15000, "Medical Expenses", 40000, LoanApplication.EmploymentStatus.SELF_EMPLOYED, 680, 38.0, 24, LoanApplication.Status.MANUAL_REVIEW, 60);

        // 3. Create active loans
        createActiveLoan(applicationRepository.findAll().get(0), app1, 50000, 45000, 8.5, 1578.50);
    }

    private User createUser(String name, String email, String password, User.Role role) {
        User user = new User();
        user.setFullName(name);
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(password));
        user.setRole(role);
        return userRepository.save(user);
    }

    private void createApplication(User applicant, User officer, double amount, String purpose, double income, LoanApplication.EmploymentStatus empStatus, int creditScore, double dti, int terms, LoanApplication.Status status, double risk) {
        LoanApplication app = new LoanApplication();
        app.setApplicant(applicant);
        app.setAssignedOfficer(officer);
        app.setLoanAmount(new BigDecimal(amount));
        app.setLoanPurpose(purpose);
        app.setAnnualIncome(new BigDecimal(income));
        app.setEmploymentStatus(empStatus);
        app.setCreditScore(creditScore);
        app.setDebtToIncomeRatio(new BigDecimal(dti));
        app.setLoanTermMonths(terms);
        app.setStatus(status);
        app.setRiskScore(new BigDecimal(risk));
        if (status == LoanApplication.Status.REJECTED) app.setRejectionReason("System rejected based on rules");
        applicationRepository.save(app);
    }

    private void createActiveLoan(LoanApplication app, User applicant, double principal, double outstanding, double rate, double emi) {
        ActiveLoan activeLoan = new ActiveLoan();
        activeLoan.setApplication(app);
        activeLoan.setApplicant(applicant);
        activeLoan.setPrincipalAmount(new BigDecimal(principal));
        activeLoan.setOutstandingBalance(new BigDecimal(outstanding));
        activeLoan.setInterestRate(new BigDecimal(rate));
        activeLoan.setEmiAmount(new BigDecimal(emi));
        activeLoan.setNextDueDate(LocalDate.now().plusMonths(1));
        activeLoanRepository.save(activeLoan);
    }
}
