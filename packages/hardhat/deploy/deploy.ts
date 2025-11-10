import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log("Deploying FHE contracts...");

  console.log("Deploying ThreeLaneAmbushFHE contract...");
  await deploy("ThreeLaneAmbushFHE", {
    from: deployer,
    args: [],
    log: true,
  });
}

// Export the main function for hardhat-deploy
export default main;