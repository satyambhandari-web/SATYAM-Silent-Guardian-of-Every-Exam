export interface CredentialData {
  student_reference: string;
  examination_id: string;
  credential_type: string;
  institution_name: string;
  grade?: string;
  issue_date: string;
}

export interface CredentialCreate {
  credential_id: string;
  credential_data: CredentialData;
}

export interface CredentialResponse {
  credential_id: string;
  document_hash: string;
  blockchain_tx_hash?: string;
  status: string;
  issued_at: string;
  credential_data?: CredentialData;
}

export interface CredentialVerificationRequest {
  credential_id: string;
  credential_data: CredentialData;
}

export interface CredentialVerificationResponse {
  credential_id: string;
  result: 'VALID' | 'TAMPERED' | 'REVOKED' | 'NOT_FOUND';
  hash_match: boolean;
  blockchain_verified: boolean;
  revoked: boolean;
}
