import { ethers } from "hardhat";

async function main() {
  // Replace with your deployed contract address
  const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";

  console.log("🔗 Connecting to DatasetNFT at:", CONTRACT_ADDRESS, "\n");

  const [deployer] = await ethers.getSigners();
  const DatasetNFT = await ethers.getContractFactory("DatasetNFT");
  const contract = DatasetNFT.attach(CONTRACT_ADDRESS);

  // Get contract info
  console.log(" Contract Info:");
  const name = await contract.name();
  const symbol = await contract.symbol();
  const totalSupply = await contract.getTotalSupply();

  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Total Supply:", totalSupply.toString());
  console.log();

  // Mint a test dataset
  console.log(" Minting test dataset...");
  const tx = await contract.mintDataset(
    deployer.address,
    "QmTestCID123456789",
    "Test Medical Dataset",
    "Sample dataset for testing purposes"
  );

  const receipt = await tx.wait();
  console.log(" Minted! Transaction hash:", receipt?.hash);

  // Get the token ID from the event
  const mintEvent = receipt?.logs.find((log: any) => {
    try {
      return contract.interface.parseLog(log)?.name === "DatasetMinted";
    } catch {
      return false;
    }
  });

  if (mintEvent) {
    const parsedEvent = contract.interface.parseLog(mintEvent);
    const tokenId = parsedEvent?.args[0];
    console.log(" Token ID:", tokenId.toString());

    // Get dataset info
    const info = await contract.getDatasetInfo(tokenId);
    console.log("\n Dataset Info:");
    console.log("IPFS CID:", info.ipfsCid);
    console.log("Name:", info.name);
    console.log("Description:", info.description);
    console.log("AI Score:", info.aiScore.toString());
    console.log("Status:", info.status);
    console.log("Creator:", info.originalCreator);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
