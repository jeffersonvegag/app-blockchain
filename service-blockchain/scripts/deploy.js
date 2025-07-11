const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FumigationService contract...");

  const FumigationService = await ethers.getContractFactory("FumigationService");
  const fumigationService = await FumigationService.deploy();

  await fumigationService.deployed();

  console.log("FumigationService deployed to:", fumigationService.address);
  console.log("Transaction hash:", fumigationService.deployTransaction.hash);

  // Wait for a few confirmations
  await fumigationService.deployTransaction.wait(5);

  console.log("Contract deployed and confirmed!");
  console.log("Contract address:", fumigationService.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });