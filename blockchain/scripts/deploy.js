const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
  const registry = await CredentialRegistry.deploy();
  await registry.waitForDeployment();
  
  const address = await registry.getAddress();
  console.log(`CredentialRegistry deployed to ${address}`);

  // Save the address and ABI for the backend
  const artifact = require("../artifacts/contracts/CredentialRegistry.sol/CredentialRegistry.json");
  const deployData = {
    address: address,
    abi: artifact.abi
  };

  fs.writeFileSync(
    path.join(__dirname, "../../backend/contract_data.json"),
    JSON.stringify(deployData, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
