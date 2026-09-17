# SATYAM Security Principles

## IMPLEMENTED PROTOTYPE Protections
- **Environment Secrets**: Hardcoded secrets avoided (configured for `.env`).
- **Blockchain Privacy**: PII is strictly kept off-chain. Only SHA-256 hashes are deployed.
- **Data Integrity**: Deterministic SHA-256 canonical hashing ensures tamper-evident credentials.
- **Input Validation**: Pydantic schemas enforce robust endpoint structures in FastAPI.
- **Audit Logging**: Actions (CREATED, REVOKED) are logged in the `audit_logs` SQLite table.

## PRODUCTION / FUTURE SCOPE
- **Password Hashing Strategy**: PBKDF2 or Argon2 for user credentials.
- **JWT/Session Strategy**: Short-lived JWTs with rotation.
- **Role-Based Access**: strict boundaries (admin/issuer/student).
- **Stronger Identity Verification**: KYC integrations.
- **Production Key Management**: Use HSM or AWS KMS for wallet keys.
- **Rate Limiting**: Throttling auth and verification routes to stop DDoS.
- **CORS Restrictions**: Limit allowed origins to production domains.
- **Production Blockchain Deployment**: Migrating from Hardhat to Polygon/Ethereum Mainnet.
