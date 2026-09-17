
import httpx
import time
import sys

API_URL = "http://127.0.0.1:8000/api/v1"

def print_step(step):
    print(f"\n{'='*50}\n{step}\n{'='*50}")

def run_demo():
    client = httpx.Client()
    
    # STEP 1 & 2 & 3: Create, Hash, Register
    print_step("STEP 1-3: CREATE CREDENTIAL (DB + Hash + Blockchain)")
    
    credential_payload = {
        "credential_id": f"CERT-{int(time.time())}",
        "credential_data": {
            "student_reference": "STUDENT-001",
            "examination_id": "EXAM-2026-FINAL",
            "credential_type": "Degree",
            "institution_name": "Demo University",
            "grade": "A+",
            "issue_date": "2026-09-16"
        }
    }
    
    response = client.post(f"{API_URL}/credentials", json=credential_payload)
    if response.status_code != 201:
        print("Failed to create credential:", response.text)
        sys.exit(1)
        
    result = response.json()
    print("Created Successfully!")
    print(f"Credential ID: {result['credential_id']}")
    print(f"Document Hash: {result['document_hash']}")
    print(f"Blockchain TX: {result['blockchain_tx_hash']}")
    
    # STEP 4: Verify Original
    print_step("STEP 4: VERIFY ORIGINAL CREDENTIAL")
    verify_payload = {
        "credential_id": result['credential_id'],
        "credential_data": credential_payload['credential_data']
    }
    response = client.post(f"{API_URL}/credentials/verify", json=verify_payload)
    verify_result = response.json()
    print("Verification Result:", verify_result['result'])
    assert verify_result['result'] == 'VALID'
    
    # STEP 5: Tamper
    print_step("STEP 5: TAMPER CREDENTIAL DATA")
    tampered_payload = {
        "credential_id": result['credential_id'],
        "credential_data": {
            **credential_payload['credential_data'],
            "grade": "A++" # Tampering the grade
        }
    }
    response = client.post(f"{API_URL}/credentials/verify", json=tampered_payload)
    tampered_result = response.json()
    print("Verification Result (after tampering):", tampered_result['result'])
    assert tampered_result['result'] == 'TAMPERED'
    
    # STEP 6: Revoke
    print_step("STEP 6: REVOKE CREDENTIAL")
    revoke_payload = {"reason": "Issued in error"}
    response = client.post(f"{API_URL}/credentials/{result['credential_id']}/revoke", json=revoke_payload)
    print("Revoke API Response:", response.json())
    
    # Verify again after revocation
    print_step("STEP 7: VERIFY AFTER REVOCATION")
    response = client.post(f"{API_URL}/credentials/verify", json=verify_payload)
    revoked_result = response.json()
    print("Verification Result (after revocation):", revoked_result['result'])
    assert revoked_result['result'] == 'REVOKED'
    
    print("\n✅ CORE DEMO COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    run_demo()
