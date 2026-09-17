const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredentialRegistry", function () {
  let CredentialRegistry;
  let registry;
  let owner;
  let issuer;
  
  const dummyHash = ethers.id("test-credential-hash");
  const dummyHash2 = ethers.id("test-credential-hash-2");
  const recordId = "REC-12345";

  beforeEach(async function () {
    [owner, issuer] = await ethers.getSigners();
    CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
    registry = await CredentialRegistry.deploy();
  });

  it("Should register a new credential hash", async function () {
    await expect(registry.connect(issuer).registerCredential(dummyHash, recordId))
      .to.emit(registry, "CredentialRegistered")
      .withArgs(dummyHash, recordId);
    
    const [isValid, hasBeenRevoked] = await registry.verifyCredential(dummyHash);
    expect(isValid).to.equal(true);
    expect(hasBeenRevoked).to.equal(false);
  });

  it("Should prevent duplicate registration", async function () {
    await registry.connect(issuer).registerCredential(dummyHash, recordId);
    await expect(
      registry.connect(issuer).registerCredential(dummyHash, recordId)
    ).to.be.revertedWith("Credential already registered");
  });

  it("Should correctly identify unregistered credentials", async function () {
    const [isValid, hasBeenRevoked] = await registry.verifyCredential(dummyHash2);
    expect(isValid).to.equal(false);
    expect(hasBeenRevoked).to.equal(false);
  });

  it("Should revoke an existing credential", async function () {
    await registry.connect(issuer).registerCredential(dummyHash, recordId);
    
    await expect(registry.connect(issuer).revokeCredential(dummyHash))
      .to.emit(registry, "CredentialRevoked")
      .withArgs(dummyHash);
      
    const [isValid, hasBeenRevoked] = await registry.verifyCredential(dummyHash);
    expect(isValid).to.equal(true);
    expect(hasBeenRevoked).to.equal(true);
  });

  it("Should prevent revoking unregistered credentials", async function () {
    await expect(
      registry.connect(issuer).revokeCredential(dummyHash2)
    ).to.be.revertedWith("Credential not registered");
  });
});
