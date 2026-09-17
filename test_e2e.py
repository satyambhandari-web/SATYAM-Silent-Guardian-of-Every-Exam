import requests
import time
import random

BASE_URL = 'http://127.0.0.1:8000/api/v1'

def test_flow():
    print('--- Starting E2E Reliability Audit ---')
    
    # 1. Health Check
    res = requests.get(f'{BASE_URL}/health')
    print('Health:', res.json())
    
    # 2. Issue Credential
    cred_id = f'DEMO-{random.randint(10000, 99999)}'
    data = {
        'student_reference': f'STU-{random.randint(10000, 99999)}',
        'examination_id': 'EXAM-2026',
        'credential_type': 'Degree Certificate',
        'institution_name': 'Demo University',
        'grade': 'A',
        'issue_date': '2026-09-17'
    }
    payload = {
        'credential_id': cred_id,
        'credential_data': data
    }
    
    print(f'\nIssuing Credential: {cred_id}')
    res = requests.post(f'{BASE_URL}/credentials', json=payload)
    print('Issue Status:', res.status_code)
    
    if res.status_code != 201 and res.status_code != 200:
        print('Error:', res.text)
        return
        
    issue_data = res.json()
    print('Document Hash:', issue_data.get('document_hash'))
    print('Blockchain TX:', issue_data.get('blockchain_tx_hash'))
    
    # 3. Verify (VALID)
    print('\nVerifying Credential (VALID)')
    res = requests.post(f'{BASE_URL}/credentials/verify', json=payload)
    print('Verify Status:', res.status_code)
    print('Verify Result:', res.json().get('result'))
    
    # 4. Tamper
    print('\nVerifying Credential (TAMPERED)')
    tampered_payload = {
        'credential_id': cred_id,
        'credential_data': {**data, 'grade': 'A++'} # Tamper grade
    }
    res = requests.post(f'{BASE_URL}/credentials/verify', json=tampered_payload)
    print('Verify Status:', res.status_code)
    print('Verify Result:', res.json().get('result'))
    
    # 5. Revoke
    print('\nRevoking Credential')
    res = requests.post(f'{BASE_URL}/credentials/{cred_id}/revoke', json={'reason': 'Compromised'})
    print('Revoke Status:', res.status_code)
    print('Revoke Response:', res.json())
    
    # 6. Verify (REVOKED)
    print('\nVerifying Credential (REVOKED)')
    res = requests.post(f'{BASE_URL}/credentials/verify', json=payload) # Use original payload
    print('Verify Status:', res.status_code)
    print('Verify Result:', res.json().get('result'))
    
    print('\n--- E2E Flow Successful ---')

if __name__ == '__main__':
    test_flow()
