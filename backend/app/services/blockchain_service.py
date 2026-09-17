import json
import os
from web3 import Web3
from typing import Tuple, Dict

class BlockchainService:
    def __init__(self):
        self.rpc_url = os.getenv("WEB3_PROVIDER_URL", "http://127.0.0.1:8545")
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        # Load ABI and Address
        contract_data_path = os.path.join(os.path.dirname(__file__), "../../contract_data.json")
        try:
            with open(contract_data_path, "r") as f:
                data = json.load(f)
                self.contract_address = data["address"]
                self.abi = data["abi"]
            self.contract = self.w3.eth.contract(address=self.contract_address, abi=self.abi)
            
            # Use first account from local hardhat node as admin/issuer
            self.account = self.w3.eth.accounts[0]
        except Exception as e:
            self.contract = None
            print(f"Warning: Blockchain contract data not found. Run hardhat deploy first. {e}")

    def register_credential_hash(self, credential_hash: str, record_id: str) -> str:
        if not self.contract:
            raise Exception("Blockchain not configured")
        
        bytes32_hash = Web3.to_bytes(hexstr=credential_hash) if credential_hash.startswith("0x") else Web3.to_bytes(hexstr="0x" + credential_hash)
        
        tx_hash = self.contract.functions.registerCredential(bytes32_hash, record_id).transact({
            'from': self.account
        })
        self.w3.eth.wait_for_transaction_receipt(tx_hash)
        return tx_hash.hex()

    def verify_credential_hash(self, credential_hash: str) -> Tuple[bool, bool]:
        if not self.contract:
            raise Exception("Blockchain not configured")
        
        bytes32_hash = Web3.to_bytes(hexstr=credential_hash) if credential_hash.startswith("0x") else Web3.to_bytes(hexstr="0x" + credential_hash)
        
        is_valid, has_been_revoked = self.contract.functions.verifyCredential(bytes32_hash).call()
        return is_valid, has_been_revoked

    def revoke_credential(self, credential_hash: str) -> str:
        if not self.contract:
            raise Exception("Blockchain not configured")
            
        bytes32_hash = Web3.to_bytes(hexstr=credential_hash) if credential_hash.startswith("0x") else Web3.to_bytes(hexstr="0x" + credential_hash)
        
        tx_hash = self.contract.functions.revokeCredential(bytes32_hash).transact({
            'from': self.account
        })
        self.w3.eth.wait_for_transaction_receipt(tx_hash)
        return tx_hash.hex()

blockchain_service = BlockchainService()
