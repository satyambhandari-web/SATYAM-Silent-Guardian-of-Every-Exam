# SATYAM API Contracts

## IMPLEMENTED Endpoints (Prototype)

### Health Check
- **Endpoint**: `GET /api/v1/health`
- **Description**: Verifies that the API service is running.

### Credentials
- `POST /api/v1/credentials`
  - **Purpose**: Create a new credential, generate hash, store off-chain, and register hash on local blockchain.
  - **Response Includes**: `credential_id`, `document_hash`, `blockchain_tx_hash`, `status`.
- `GET /api/v1/credentials/{id}`
  - **Purpose**: Retrieve credential metadata (no sensitive student info).
- `POST /api/v1/credentials/{id}/revoke`
  - **Purpose**: Revoke an existing credential on-chain and in DB.

### Verification
- `POST /api/v1/verify`
  - **Purpose**: Verifies credential integrity by reproducing the hash and checking on-chain status.
  - **Possible Results**: `VALID`, `TAMPERED`, `REVOKED`, `NOT_FOUND`.

## PLANNED Endpoints (Future Scope)

### Authentication
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`

### Examinations
- `POST /api/v1/exams`
- `GET /api/v1/exams/{id}`

### Audit
- `GET /api/v1/audit/{id}`
