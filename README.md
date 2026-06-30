# FinShield Underwriting Engine

FinShield is an enterprise-grade automated loan underwriting and credit risk assessment platform. It features a React frontend and a Java Spring Boot backend, evaluating loan applications in real-time and providing role-specific dashboards.

## Architecture

- **Backend**: Java 21, Spring Boot 3.x, PostgreSQL, Redis, Spring Security (JWT), Spring Batch, Resilience4j.
- **Frontend**: React 18, Vite, React Router, Tailwind CSS, Recharts, React Hook Form, React Toastify.
- **Infrastructure**: Docker & Docker Compose for orchestration.

```
+----------------+      +-------------------+      +----------------+
|                |      |                   |      |                |
| React Frontend | <--> | Spring Boot API   | <--> | PostgreSQL DB  |
| (Vite)         |      | (Backend)         |      | (Primary Data) |
|                |      |                   |      +----------------+
+----------------+      +-------------------+             ^
                               |                          |
                               v                          |
                        +-------------------+             |
                        |                   |      +----------------+
                        | Redis (Idempotency|      |                |
                        | Cache)            |      | Spring Batch   |
                        |                   |      | (EOD Amortize) |
                        +-------------------+      +----------------+
```

## Setup Instructions

1. Ensure Docker and Docker Compose are installed on your machine.
2. Clone this repository.
3. Run `docker-compose up --build -d` from the root directory.
4. Access the frontend at `http://localhost:5173`
5. The backend API is available at `http://localhost:8080`

## Seeded Users

You can log in with the following seeded accounts:

- **Admin**: `admin@finshield.com` / `Admin@123`
- **Loan Officer**: `officer@finshield.com` / `Officer@123`
- **Applicant 1**: `john.doe@email.com` / `John@123`
- **Applicant 2**: `jane.smith@email.com` / `Jane@123`

## Key Technical Implementations

- **Spring AOP for Idempotency**: Prevents duplicate loan application submissions via the `@Idempotent` annotation and Redis cache.
- **Spring Batch for EOD Amortization**: Efficiently processes daily interest accrual using chunk-oriented processing (`JpaPagingItemReader`).
- **Optimistic Locking**: Prevents concurrent modification anomalies on active loans using JPA `@Version`.
- **Resilience4j Circuit Breaker**: Wraps the mock external credit bureau service, falling back to a cached result gracefully when unavailable.
- **Immutable Ledger**: The `loan_ledger` table strictly tracks financial transactions for audit and compliance.
