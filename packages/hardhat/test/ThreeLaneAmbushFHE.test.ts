import { HardhatFhevmRuntimeEnvironment, FhevmType } from "@fhevm/hardhat-plugin";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import * as hre from "hardhat";

interface Signers {
  owner: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
}

async function deployFixture() {
  const factory = await ethers.getContractFactory("ThreeLaneAmbushFHE");
  const contract = await factory.deploy();
  const contractAddress = await contract.getAddress();
  return { contract, contractAddress };
}

describe("ThreeLaneAmbushFHE", function () {
  let contract: any;
  let contractAddress: string;
  let signers: Signers;
  let fhevm: HardhatFhevmRuntimeEnvironment;

  before(async function () {
    // This test suite uses mock FHE for fast local testing
    if (!hre.fhevm.isMock) {
      this.skip();
    }
    fhevm = hre.fhevm;
    const ethSigners = await ethers.getSigners();
    signers = {
      owner: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
    };
  });

  beforeEach(async function () {
    const deployment = await deployFixture();
    contract = deployment.contract;
    contractAddress = deployment.contractAddress;
  });

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      expect(contractAddress).to.be.properAddress;
    });

    it("should have no result for new player", async function () {
      const result = await contract.getEncryptedResult(signers.alice.address);
      expect(result).to.eq(ethers.ZeroHash);
    });
  });

  describe("Play Function", function () {
    it("should accept encrypted lane and power inputs", async function () {
      // Encrypt lane=2 (Center) and power=5
      const encryptedLane = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(2)
        .encrypt();

      const encryptedPower = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(5)
        .encrypt();

      // Play the game
      const tx = await contract
        .connect(signers.alice)
        .play(
          encryptedLane.handles[0],
          encryptedLane.inputProof,
          encryptedPower.handles[0],
          encryptedPower.inputProof
        );
      await tx.wait();

      // Verify result exists (non-zero handle)
      const encryptedResult = await contract.getEncryptedResult(signers.alice.address);
      expect(encryptedResult).to.not.eq(ethers.ZeroHash);
    });

    it("should produce valid game outcome (0=Loss, 1=Draw, 2=Win)", async function () {
      // Encrypt lane=1 (Left) and power=9 (max)
      const encryptedLane = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(1)
        .encrypt();

      const encryptedPower = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(9)
        .encrypt();

      const tx = await contract
        .connect(signers.alice)
        .play(
          encryptedLane.handles[0],
          encryptedLane.inputProof,
          encryptedPower.handles[0],
          encryptedPower.inputProof
        );
      await tx.wait();

      // Decrypt the result
      const encryptedResult = await contract.getEncryptedResult(signers.alice.address);
      const clearResult = await fhevm.userDecryptEuint(
        FhevmType.euint8,
        encryptedResult,
        contractAddress,
        signers.alice
      );

      // Result must be 0 (Loss), 1 (Draw), or 2 (Win)
      expect(clearResult).to.be.oneOf([0n, 1n, 2n]);
    });

    it("should emit GameResultReady event", async function () {
      const encryptedLane = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(2)
        .encrypt();

      const encryptedPower = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(5)
        .encrypt();

      await expect(
        contract
          .connect(signers.alice)
          .play(
            encryptedLane.handles[0],
            encryptedLane.inputProof,
            encryptedPower.handles[0],
            encryptedPower.inputProof
          )
      ).to.emit(contract, "GameResultReady").withArgs(signers.alice.address);
    });
  });

  describe("Multiple Games", function () {
    it("should allow same player to play multiple times", async function () {
      // First game
      let encryptedLane = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(1)
        .encrypt();
      let encryptedPower = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(3)
        .encrypt();

      let tx = await contract
        .connect(signers.alice)
        .play(
          encryptedLane.handles[0],
          encryptedLane.inputProof,
          encryptedPower.handles[0],
          encryptedPower.inputProof
        );
      await tx.wait();

      const firstResult = await contract.getEncryptedResult(signers.alice.address);

      // Second game - result should be overwritten
      encryptedLane = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(3)
        .encrypt();
      encryptedPower = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(7)
        .encrypt();

      tx = await contract
        .connect(signers.alice)
        .play(
          encryptedLane.handles[0],
          encryptedLane.inputProof,
          encryptedPower.handles[0],
          encryptedPower.inputProof
        );
      await tx.wait();

      const secondResult = await contract.getEncryptedResult(signers.alice.address);

      // Results should be different (new game overwrites)
      expect(secondResult).to.not.eq(firstResult);
    });

    it("should support multiple players simultaneously", async function () {
      // Alice plays
      const aliceLane = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(1)
        .encrypt();
      const alicePower = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(5)
        .encrypt();

      // Bob plays
      const bobLane = await fhevm
        .createEncryptedInput(contractAddress, signers.bob.address)
        .add8(2)
        .encrypt();
      const bobPower = await fhevm
        .createEncryptedInput(contractAddress, signers.bob.address)
        .add8(6)
        .encrypt();

      // Execute both games
      const txAlice = await contract
        .connect(signers.alice)
        .play(aliceLane.handles[0], aliceLane.inputProof, alicePower.handles[0], alicePower.inputProof);
      const txBob = await contract
        .connect(signers.bob)
        .play(bobLane.handles[0], bobLane.inputProof, bobPower.handles[0], bobPower.inputProof);

      await txAlice.wait();
      await txBob.wait();

      // Both should have results
      const aliceResult = await contract.getEncryptedResult(signers.alice.address);
      const bobResult = await contract.getEncryptedResult(signers.bob.address);

      expect(aliceResult).to.not.eq(ethers.ZeroHash);
      expect(bobResult).to.not.eq(ethers.ZeroHash);
    });
  });

  describe("Access Control", function () {
    it("should only allow authorized player to decrypt their result", async function () {
      // Alice plays
      const encryptedLane = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(2)
        .encrypt();
      const encryptedPower = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(5)
        .encrypt();

      const tx = await contract
        .connect(signers.alice)
        .play(
          encryptedLane.handles[0],
          encryptedLane.inputProof,
          encryptedPower.handles[0],
          encryptedPower.inputProof
        );
      await tx.wait();

      // Alice can decrypt her result
      const encryptedResult = await contract.getEncryptedResult(signers.alice.address);
      const aliceResult = await fhevm.userDecryptEuint(
        FhevmType.euint8,
        encryptedResult,
        contractAddress,
        signers.alice
      );
      expect(aliceResult).to.be.oneOf([0n, 1n, 2n]);

      // Bob cannot decrypt Alice's result
      await expect(
        fhevm.userDecryptEuint(FhevmType.euint8, encryptedResult, contractAddress, signers.bob)
      ).to.be.rejected;
    });
  });

  describe("Edge Cases", function () {
    it("should handle minimum lane and power values", async function () {
      const encryptedLane = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(1) // min lane
        .encrypt();
      const encryptedPower = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(1) // min power
        .encrypt();

      const tx = await contract
        .connect(signers.alice)
        .play(
          encryptedLane.handles[0],
          encryptedLane.inputProof,
          encryptedPower.handles[0],
          encryptedPower.inputProof
        );
      await tx.wait();

      const result = await contract.getEncryptedResult(signers.alice.address);
      expect(result).to.not.eq(ethers.ZeroHash);
    });

    it("should handle maximum lane and power values", async function () {
      const encryptedLane = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(3) // max lane
        .encrypt();
      const encryptedPower = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add8(9) // max power
        .encrypt();

      const tx = await contract
        .connect(signers.alice)
        .play(
          encryptedLane.handles[0],
          encryptedLane.inputProof,
          encryptedPower.handles[0],
          encryptedPower.inputProof
        );
      await tx.wait();

      const result = await contract.getEncryptedResult(signers.alice.address);
      expect(result).to.not.eq(ethers.ZeroHash);
    });
  });
});
