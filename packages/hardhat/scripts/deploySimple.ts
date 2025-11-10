import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ThreeLaneAmbushFHE...");
  
  const ThreeLaneAmbush = await ethers.getContractFactory("ThreeLaneAmbushFHE");
  const contract = await ThreeLaneAmbush.deploy();
  
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("ThreeLaneAmbush deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

