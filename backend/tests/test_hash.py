from app.services.hash_service import generate_credential_hash, verify_credential_hash

def test_hash_generation():
    data1 = {"name": "Alice", "score": 95, "exam": "CS101"}
    data2 = {"exam": "CS101", "name": "Alice", "score": 95} # different key order
    
    hash1 = generate_credential_hash(data1)
    hash2 = generate_credential_hash(data2)
    
    assert hash1 == hash2
    assert len(hash1) == 64 # SHA-256

def test_hash_verification():
    data = {"name": "Bob", "score": 88}
    expected_hash = generate_credential_hash(data)
    
    assert verify_credential_hash(data, expected_hash) == True
    
    tampered_data = {"name": "Bob", "score": 99}
    assert verify_credential_hash(tampered_data, expected_hash) == False
