# SATYAM Blockchain Architecture

## Purpose
The blockchain layer provides a tamper-evident registry for academic credentials and examination records.

## Privacy & Data Minimization
**CRITICAL RULE:** Do NOT store sensitive personal information on-chain.
- **DO NOT STORE**: Student names, phone numbers, emails, grades.
- **STORE**: Credential hashes, record identifiers, issuer references, timestamps, revocation status.

## Planned Smart Contract: `CredentialRegistry`
Responsibilities (PLANNED):
- `registerCredential(bytes32 credentialHash, string recordId)`
- `revokeCredential(bytes32 credentialHash)`
- `verifyCredential(bytes32 credentialHash)` -> Returns valid/revoked status.
