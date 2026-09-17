from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.models.base import Base

class Institution(Base):
    __tablename__ = "institutions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Examination(Base):
    __tablename__ = "examinations"
    
    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    name = Column(String, nullable=False)
    date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Credential(Base):
    __tablename__ = "credentials"
    
    id = Column(Integer, primary_key=True, index=True)
    credential_id = Column(String, unique=True, index=True, nullable=False)
    examination_id = Column(Integer, ForeignKey("examinations.id"), nullable=True)
    # student_reference is an internal/demo identifier (NO PII)
    student_reference = Column(String, index=True, nullable=False)
    credential_type = Column(String, nullable=False)
    
    document_hash = Column(String, nullable=False, unique=True)
    blockchain_tx_hash = Column(String, nullable=True)
    
    status = Column(String, default="VALID") # VALID, REVOKED
    credential_data_json = Column(Text, nullable=True) # Full JSON data for digital certificate
    
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class VerificationRecord(Base):
    __tablename__ = "verification_records"
    
    id = Column(Integer, primary_key=True, index=True)
    credential_id = Column(String, index=True, nullable=False)
    verification_result = Column(String, nullable=False) # VALID, TAMPERED, REVOKED, NOT_FOUND
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False) # CREATED, REGISTERED, VERIFIED, REVOKED
    credential_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
