// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CredentialRegistry {
    event CredentialRegistered(bytes32 indexed credentialHash, string recordId);
    event CredentialRevoked(bytes32 indexed credentialHash);

    mapping(bytes32 => bool) public isRegistered;
    mapping(bytes32 => bool) public isRevoked;

    function registerCredential(bytes32 credentialHash, string memory recordId) external {
        require(!isRegistered[credentialHash], "Credential already registered");
        isRegistered[credentialHash] = true;
        emit CredentialRegistered(credentialHash, recordId);
    }

    function revokeCredential(bytes32 credentialHash) external {
        require(isRegistered[credentialHash], "Credential not registered");
        require(!isRevoked[credentialHash], "Credential already revoked");
        isRevoked[credentialHash] = true;
        emit CredentialRevoked(credentialHash);
    }

    function verifyCredential(bytes32 credentialHash) external view returns (bool isValid, bool hasBeenRevoked) {
        isValid = isRegistered[credentialHash];
        hasBeenRevoked = isRevoked[credentialHash];
    }
}
