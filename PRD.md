# PRD: Three-Lane Ambush

## 1. Vision
*A simple, verifiable, and private on-chain micro-game that protects player strategy through Fully Homomorphic Encryption (FHE).*

## 2. Problem & FHE's Unique Value
*   **The Problem**: In traditional on-chain games, player strategies (e.g., moves, troop deployments) are often submitted as plaintext. This exposes them to opponents, leading to strategic analysis, or worse, front-running by MEV bots. This fundamentally undermines fairness and strategic depth.
*   **FHE's Unique Value**: FHE is the only technology that allows the core game logic—comparing lanes and power levels—to be executed entirely on encrypted data. No one, not even the network validators, can see the specific moves made by the player or the computer. Only the final win/draw/loss outcome is revealed privately to the player, perfectly preserving strategic privacy.

## 3. Core Features
*   **Encrypted Move Submission**: The player's chosen lane (Left/Middle/Right) and power (1-9) are encrypted on the client-side before being submitted to the smart contract as ciphertext.
*   **Private On-Chain Adjudication**: The smart contract compares the player's encrypted move with the computer's pre-set encrypted move. It determines if the lanes match and which power level is greater, all without ever decrypting the data.
*   **Minimal Result Disclosure**: The contract's output is an encrypted "result handle" (representing Win, Draw, or Loss). The player decrypts this handle locally to view their result, ensuring the specific moves of both parties remain confidential forever.
