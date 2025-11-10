import { ethers } from "hardhat";

async function main() {
  console.log(" Starting deployment to Polkadot Asset Hub...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(" Deploying contracts with account:", deployer.address);

  // Get balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(" Account balance:", ethers.formatEther(balance), "PAS\n");

  if (balance === 0n) {
    console.error(" Error: Insufficient balance!");
    console.log(
      " Get PAS tokens from: https://faucet.polkadot.io/?parachain=1111"
    );
    process.exit(1);
  }

  // Deploy DatasetNFT
  console.log(" Deploying DatasetNFT contract...");
  const DatasetNFT = await ethers.getContractFactory("DatasetNFT");
  const datasetNFT = await DatasetNFT.deploy();

  await datasetNFT.waitForDeployment();

  const contractAddress = await datasetNFT.getAddress();

  console.log(" DatasetNFT deployed to:", contractAddress);
  console.log(
    "🔗 View on explorer:",
    `https://blockscout-passet-hub.parity-testnet.parity.io/address/${contractAddress}`
  );

  // Verify roles
  console.log("\n Verifying roles...");
  const hasAdminRole = await datasetNFT.hasRole(
    await datasetNFT.DEFAULT_ADMIN_ROLE(),
    deployer.address
  );
  const hasMinterRole = await datasetNFT.hasRole(
    await datasetNFT.MINTER_ROLE(),
    deployer.address
  );
  const hasVerifierRole = await datasetNFT.hasRole(
    await datasetNFT.VERIFIER_ROLE(),
    deployer.address
  );

  console.log("✓ Admin role:", hasAdminRole ? "✅" : "❌");
  console.log("✓ Minter role:", hasMinterRole ? "✅" : "❌");
  console.log("✓ Verifier role:", hasVerifierRole ? "✅" : "❌");

  // Save deployment info
  console.log("\n📄 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract: DatasetNFT");
  console.log("Address:", contractAddress);
  console.log("Network: Paseo Asset Hub Testnet");
  console.log("Chain ID: 420420422");
  console.log("Deployer:", deployer.address);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("💡 Next steps:");
  console.log("1. Save the contract address above");
  console.log("2. Update your frontend config with the address");
  console.log("3. Test minting a dataset NFT");
  console.log("4. Grant roles to your backend (if needed)\n");

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(" Deployment failed:", error);
    process.exit(1);
  });
