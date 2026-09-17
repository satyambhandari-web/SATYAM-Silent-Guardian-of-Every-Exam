import json
import csv
import io
import time
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.db.database import get_db
from app.models.domain import Credential, AuditLog, Examination, Institution
from app.schemas.credential import CredentialCreate, CredentialResponse, CredentialVerificationRequest, CredentialVerificationResponse, CredentialRevokeRequest
from app.services.hash_service import generate_credential_hash, verify_credential_hash
from app.services.blockchain_service import blockchain_service

router = APIRouter(prefix="/credentials", tags=["Credentials"])

@router.post("", response_model=CredentialResponse, status_code=status.HTTP_201_CREATED)
def create_credential(request: CredentialCreate, db: Session = Depends(get_db)):
    # 1. Validate - check if duplicate
    if db.query(Credential).filter(Credential.credential_id == request.credential_id).first():
        raise HTTPException(status_code=400, detail="Credential already exists")

    # 2. Canonicalize & Hash
    cred_dict = request.credential_data.model_dump()
    doc_hash = generate_credential_hash(cred_dict)
    
    # Ensure dummy institution/exam exists for ForeignKeys to not break SQLite
    inst = db.query(Institution).first()
    if not inst:
        inst = Institution(name="Demo Institution")
        db.add(inst)
        db.commit()
    exam = db.query(Examination).first()
    if not exam:
        exam = Examination(institution_id=inst.id, name="Demo Exam")
        db.add(exam)
        db.commit()

    # 3. Save to DB
    new_cred = Credential(
        credential_id=request.credential_id,
        examination_id=exam.id,
        student_reference=request.credential_data.student_reference,
        credential_type=request.credential_data.credential_type,
        document_hash=doc_hash,
        credential_data_json=json.dumps(cred_dict),
        status="VALID"
    )
    db.add(new_cred)
    try:
        db.commit()
        db.refresh(new_cred)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="A credential with this exact data already exists (Duplicate Document Hash).")

    # 4. Register on Blockchain
    try:
        tx_hash = blockchain_service.register_credential_hash(doc_hash, new_cred.credential_id)
        new_cred.blockchain_tx_hash = tx_hash
        db.commit()
        db.refresh(new_cred)
    except Exception as e:
        db.delete(new_cred) # rollback
        db.commit()
        raise HTTPException(status_code=500, detail=f"Blockchain registration failed: {str(e)}")

    # 5. Audit Log
    db.add(AuditLog(action="CREATED", credential_id=new_cred.credential_id, details="Credential created and registered on-chain"))
    db.commit()

    return CredentialResponse(
        credential_id=new_cred.credential_id,
        document_hash=new_cred.document_hash,
        blockchain_tx_hash=new_cred.blockchain_tx_hash,
        status=new_cred.status,
        issued_at=new_cred.issued_at,
        credential_data=request.credential_data
    )

@router.post("/bulk-issue")
async def bulk_issue_credentials(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")

    contents = await file.read()
    decoded = contents.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))
    
    successful = []
    failed = []
    total = 0
    
    # Ensure dummy institution/exam exists for bulk (if not already)
    inst = db.query(Institution).first()
    if not inst:
        inst = Institution(name="Demo Institution")
        db.add(inst)
        db.commit()
    exam = db.query(Examination).first()
    if not exam:
        exam = Examination(institution_id=inst.id, name="Demo Exam")
        db.add(exam)
        db.commit()

    for row in reader:
        total += 1
        try:
            from app.schemas.credential import CredentialData
            
            # Map CSV headers to schema
            cred_data = CredentialData(
                student_reference=row.get("Student Reference", ""),
                examination_id=row.get("Examination ID", ""),
                credential_type=row.get("Credential Type", ""),
                institution_name=row.get("Institution Name", ""),
                grade=row.get("Grade", ""),
                issue_date=row.get("Issue Date", "")
            )
            
            cred_id = f"CERT-{int(time.time() * 1000)}-{total}"
            
            # 1. Check duplicate ID
            if db.query(Credential).filter(Credential.credential_id == cred_id).first():
                failed.append({"row": total, "reason": "Credential ID collision"})
                continue
                
            # 2. Canonicalize & Hash
            cred_dict = cred_data.model_dump()
            doc_hash = generate_credential_hash(cred_dict)
            
            # 3. Save to DB
            new_cred = Credential(
                credential_id=cred_id,
                examination_id=exam.id,
                student_reference=cred_data.student_reference,
                credential_type=cred_data.credential_type,
                document_hash=doc_hash,
                credential_data_json=json.dumps(cred_dict),
                status="VALID"
            )
            db.add(new_cred)
            try:
                db.commit()
                db.refresh(new_cred)
            except IntegrityError:
                db.rollback()
                failed.append({"row": total, "student_reference": cred_data.student_reference, "reason": "Duplicate Document Hash"})
                continue
                
            # 4. Register on Blockchain
            try:
                tx_hash = blockchain_service.register_credential_hash(doc_hash, new_cred.credential_id)
                new_cred.blockchain_tx_hash = tx_hash
                db.commit()
            except Exception as e:
                db.delete(new_cred)
                db.commit()
                failed.append({"row": total, "student_reference": cred_data.student_reference, "reason": f"Blockchain failure: {str(e)}"})
                continue
                
            db.add(AuditLog(action="CREATED", credential_id=cred_id, details="Bulk credential created and registered on-chain"))
            db.commit()
            
            successful.append({"credential_id": cred_id, "student_reference": cred_data.student_reference})
            
        except Exception as e:
            db.rollback()
            failed.append({"row": total, "reason": str(e)})

    return {
        "total_processed": total,
        "successful": successful,
        "failed": failed
    }

@router.post("/verify", response_model=CredentialVerificationResponse)
def verify_credential(request: CredentialVerificationRequest, db: Session = Depends(get_db)):
    cred_dict = request.credential_data.model_dump()
    generated_hash = generate_credential_hash(cred_dict)
    
    db_cred = db.query(Credential).filter(Credential.credential_id == request.credential_id).first()
    
    if not db_cred:
        return CredentialVerificationResponse(
            credential_id=request.credential_id,
            result="NOT_FOUND",
            hash_match=False,
            blockchain_verified=False,
            revoked=False
        )

    hash_match = (db_cred.document_hash == generated_hash)
    
    try:
        is_valid_onchain, is_revoked_onchain = blockchain_service.verify_credential_hash(generated_hash)
    except Exception:
        # Fallback if blockchain is completely unavailable
        is_valid_onchain = False
        is_revoked_onchain = False

    result = "VALID"
    if not hash_match:
        result = "TAMPERED"
    elif db_cred.status == "REVOKED" or is_revoked_onchain:
        result = "REVOKED"
        
    return CredentialVerificationResponse(
        credential_id=request.credential_id,
        result=result,
        hash_match=hash_match,
        blockchain_verified=is_valid_onchain,
        revoked=(db_cred.status == "REVOKED" or is_revoked_onchain)
    )

@router.post("/{credential_id}/revoke")
def revoke_credential(credential_id: str, request: CredentialRevokeRequest, db: Session = Depends(get_db)):
    db_cred = db.query(Credential).filter(Credential.credential_id == credential_id).first()
    if not db_cred:
        raise HTTPException(status_code=404, detail="Credential not found")
        
    if db_cred.status == "REVOKED":
        raise HTTPException(status_code=400, detail="Credential already revoked")
        
    try:
        blockchain_service.revoke_credential(db_cred.document_hash)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blockchain revocation failed: {str(e)}")
        
    db_cred.status = "REVOKED"
    import datetime
    db_cred.revoked_at = datetime.datetime.now()
    db.commit()
    
    db.add(AuditLog(action="REVOKED", credential_id=credential_id, details=f"Reason: {request.reason}"))
    db.commit()
    
    return {"status": "success", "message": "Credential revoked successfully"}

@router.get("/{credential_id}", response_model=CredentialResponse)
def get_credential(credential_id: str, db: Session = Depends(get_db)):
    db_cred = db.query(Credential).filter(Credential.credential_id == credential_id).first()
    if not db_cred:
        raise HTTPException(status_code=404, detail="Credential not found")
        
    cred_data = None
    if db_cred.credential_data_json:
        cred_data = json.loads(db_cred.credential_data_json)
        
    return CredentialResponse(
        credential_id=db_cred.credential_id,
        document_hash=db_cred.document_hash,
        blockchain_tx_hash=db_cred.blockchain_tx_hash,
        status=db_cred.status,
        issued_at=db_cred.issued_at,
        credential_data=cred_data
    )
