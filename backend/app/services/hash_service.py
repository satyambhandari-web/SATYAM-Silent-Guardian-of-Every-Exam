import hashlib
import json
from typing import Dict, Any

def _canonicalize(data: Dict[str, Any]) -> str:
    """
    Creates a canonical, deterministic string representation of a dictionary.
    Keys are sorted alphabetically to ensure the same data always produces the same string.
    """
    # Remove any None or empty values if necessary, or just rely on exact match
    return json.dumps(data, sort_keys=True, separators=(',', ':'))

def generate_credential_hash(data: Dict[str, Any]) -> str:
    """
    Generates a SHA-256 hash from a canonicalized dictionary.
    """
    canonical_string = _canonicalize(data)
    return hashlib.sha256(canonical_string.encode('utf-8')).hexdigest()

def verify_credential_hash(data: Dict[str, Any], expected_hash: str) -> bool:
    """
    Verifies if the provided data hashes to the expected hash.
    """
    generated = generate_credential_hash(data)
    return generated == expected_hash
