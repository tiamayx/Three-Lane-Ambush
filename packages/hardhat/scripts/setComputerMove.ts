import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x7601beFe3af10d1ac82A41b7A6413C5A2ef3e1A8";
  
  // Get the contract
  const ThreeLaneAmbush = await ethers.getContractFactory("ThreeLaneAmbush");
  const contract = ThreeLaneAmbush.attach(contractAddress);

  console.log("Setting computer move...");
  
  // For simplicity, we'll set the computer to always choose:
  // Lane: 2 (Center)
  // Power: 5
  // In a real game, these would be encrypted values
  
  // Create dummy encrypted values (32 bytes each)
  // In reality, these should be properly encrypted using FHEVM
  const encryptedLane = ethers.zeroPadValue("0x02", 32); // Lane 2 (Center)
  const encryptedPower = ethers.zeroPadValue("0x05", 32); // Power 5
  
  const tx = await contract.setComputerMove(encryptedLane, encryptedPower);
  console.log("Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("Computer move set successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

