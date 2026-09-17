from app.db.database import SessionLocal
from app.api.routes.credentials import create_credential
from app.schemas.credential import CredentialCreate, CredentialData
import random

db = SessionLocal()
req = CredentialCreate(
    credential_id=f'TEST-CRED-{random.randint(10000, 99999)}',
    credential_data=CredentialData(
        student_reference=f'STUDENT-{random.randint(10000, 99999)}',
        examination_id='EXAM-2026',
        credential_type='Degree Certificate',
        institution_name='Demo University',
        grade='A',
        issue_date='2026-09-17'
    )
)
try:
    res = create_credential(request=req, db=db)
    print("SUCCESS!")
    print(res)
except Exception as e:
    import traceback
    traceback.print_exc()
