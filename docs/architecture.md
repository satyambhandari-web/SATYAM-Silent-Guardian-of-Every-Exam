# SATYAM Architecture

## 1. System Overview
SATYAM employs a clean, modular architecture separating the client, API service, relational database, and blockchain registry.

## 2. Components
- **Frontend**: React (Vite) SPA for user interfaces.
- **Backend**: FastAPI service for business logic and data access.
- **Database**: PostgreSQL/SQLite (via SQLAlchemy) for off-chain relational data.
- **Blockchain**: Solidity smart contracts for decentralized integrity verification.

## 3. Database Schema Direction (PLANNED)
- `users`: Authentication and roles.
- `institutions`: Organizations issuing credentials.
- `examinations`: Details regarding tests.
- `credentials`: Issued credentials linking users and exams, holding the on-chain hash reference.
- `verification_records`: Activity logs of verification attempts.
- `audit_logs`: System audit events.

## 4. Constraints
- Strict separation of PII (kept off-chain) and integrity proofs (kept on-chain).
