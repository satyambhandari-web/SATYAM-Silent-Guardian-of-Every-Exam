from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime

class CredentialData(BaseModel):
    # This represents the payload of the credential for hashing
    student_reference: str
    examination_id: str
    credential_type: str
    institution_name: str
    grade: Optional[str] = None
    issue_date: str

class CredentialCreate(BaseModel):
    credential_id: str
    credential_data: CredentialData

class CredentialResponse(BaseModel):
    credential_id: str
    document_hash: str
    blockchain_tx_hash: Optional[str] = None
    status: str
    issued_at: datetime
    credential_data: Optional[CredentialData] = None

class CredentialVerificationRequest(BaseModel):
    credential_id: str
    credential_data: CredentialData

class CredentialVerificationResponse(BaseModel):
    credential_id: str
    result: str # VALID, TAMPERED, REVOKED, NOT_FOUND
    hash_match: bool
    blockchain_verified: bool
    revoked: bool

class CredentialRevokeRequest(BaseModel):
    reason: Optional[str] = None
