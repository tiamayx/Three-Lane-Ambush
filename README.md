# Three Lane Ambush
> A fully on-chain tactical game powered by Fully Homomorphic Encryption (FHE), where player strategies remain confidential from deployment to resolution.

## Vision & The FHE Advantage

In the world of on-chain strategy games, a fundamental dilemma exists: how to ensure fairness and prevent information leakage (like miner front-running or peer-to-peer snooping) without sacrificing decentralization. Traditional solutions often rely on centralized servers or complex commit-reveal schemes, which either introduce single points of failure or offer a poor user experience.

`Three Lane Ambush` solves this problem by leveraging Zama's FHEVM. Our vision is to create a truly trustless and strategic gaming environment where a player's tactical decisions—their chosen lane and force level—are encrypted from the moment they are conceived. These choices are processed on-chain in their encrypted state, meaning no one, not even the network validators, can decipher the strategy before the battle is resolved.

**Why FHE is crucial:** Fully Homomorphic Encryption is the only technology that allows for computation on encrypted data. This means `Three Lane Ambush` can offer something no other architecture can: **provable strategic privacy on a public blockchain.** Players can be certain that their moves are confidential, eliminating the possibility of being outmaneuvered by adversaries who have privileged access to transaction data. This ushers in a new era of fair, transparent, and truly strategic on-chain gaming.

## Demo

-   **Live Application:** https://three-lane-ambush-nextjs-showcase.vercel.app/
-   **Demo Video:** `[Link to YouTube/Vimeo Video]`
-   **Smart Contract on Sepolia:** `https://sepolia.etherscan.io/address/0x3A31FecA5759C9e7F819f707FCAF50019084077f`

## How to Play

Welcome, Commander. Your mission is to outmaneuver the enemy in a tactical simulation. Victory requires careful planning and resource management.

1.  **Connect Your Wallet**: Click the "Connect Wallet" button to link your Sepolia testnet wallet. The operation cannot begin until your identity is verified.
2.  **Select Attack Vector**: Choose one of the three lanes to focus your assault. A direct attack on the enemy's chosen lane gives you an advantage.
3.  **Set Force Level**: Use the slider to allocate your forces, from a light skirmish (1) to an all-out assault (9).
4.  **Execute Operation**: Once your strategy is set, click "EXECUTE OPERATION". Your tactical choices will be encrypted and sent securely to the blockchain for resolution.
5.  **Await Outcome**: The on-chain FHE computation will determine the battle's result. Your browser will decrypt and display whether you achieved **VICTORY**, a **DRAW**, or suffered a **LOSS**.

**Winning Conditions:**
*   **Direct Hit & Superior Force**: If you choose the same lane as the enemy and your Force Level is higher, you win.
*   **Draw**: If you both choose the same lane with the same Force Level, or if you choose different lanes, the result is a draw.
*   **Loss**: If you choose the same lane as the enemy but your Force Level is lower, you are defeated.

## Tech Stack

-   **Frontend**: Next.js, React, TypeScript, Tailwind CSS
-   **Blockchain Interaction**: Ethers.js
-   **Smart Contracts**: Solidity, Hardhat
-   **FHE Implementation**: Zama FHEVM, @zama-fhe/relayer-sdk
-   **Deployment**: Vercel (Frontend), Sepolia Testnet (Contracts)

## How FHE Powers This Project & Architecture

The entire gameplay loop of `Three Lane Ambush` is designed around Zama's FHEVM, ensuring that player strategy is never exposed on the public blockchain. Our architecture follows a "Minimalist Backend" principle, where the smart contract's sole responsibility is to execute the core FHE computation.

### The Confidential Workflow:

1.  **Frontend Encryption (Client-Side)**: When a player decides on their `Attack Vector` (Lane 1, 2, or 3) and `Force Level` (Power 1-9), these inputs are not sent in plaintext. Instead, the `@zama-fhe/relayer-sdk` in the browser encrypts these two values into `euint8` ciphertexts using the FHEVM public key.

2.  **Encrypted Transaction**: The player's browser sends a transaction to the `ThreeLaneAmbushFHE.sol` smart contract. The transaction payload contains the handles to the encrypted lane and power, along with a proof to validate the ciphertexts. The actual strategic data remains encrypted.

3.  **On-Chain FHE Computation (Smart Contract)**:
    *   The contract generates the computer's move (lane and power) as encrypted values using `FHE.randEuint8()`.
    *   It then performs all game logic comparisons (`FHE.eq` for checking lanes, `FHE.gt` for comparing power) directly on the encrypted data.
    *   A final encrypted result (`euint8` representing Win, Draw, or Loss) is computed using `FHE.select`. At no point is any strategic data decrypted on-chain.

4.  **Permission and Decryption (Client-Side)**:
    *   The smart contract uses `FHE.allow()` to grant the player (and only the player) permission to decrypt the final result ciphertext.
    *   The frontend retrieves the encrypted result handle.
    *   The player signs a message to prove ownership, and the `@zama-fhe/relayer-sdk` uses this signature to decrypt the result locally in their browser. The final outcome (WIN, DRAW, or LOSS) is then displayed.

### Technical Architecture Diagram:

```
[ Player's Browser ]                                  [ Sepolia Blockchain ]
       |                                                        |
1. Encrypt(Lane, Power)                                         |
   - Uses @zama-fhe/relayer-sdk                             |
       |                                                        |
       |------------ TX w/ Encrypted Data -------------------->|
       |                                                        |
       |                                                 [ Smart Contract ]
       |                                                 - Generates encrypted AI move
       |                                                 - Compares encrypted values (FHE ops)
       |                                                 - Computes encrypted result
       |                                                 - Grants decryption permission
       |                                                        |
       |<----------- Encrypted Result Handle ------------------|
       |                                                        |
2. Decrypt(Result)                                              |
   - Player signs message                                       |
   - Uses @zama-fhe/relayer-sdk                             |
       |                                                        |
[ Display Outcome ]                                       [      -      ]
```

## Quick Start & Deployment

### Run Locally

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/tiamayx/Three-Lane-Ambush.git
    cd Three-Lane-Ambush
    ```

2.  **Install Dependencies:**
    This project uses `pnpm` as its package manager.
    ```bash
    pnpm install
    ```

3.  **Run the Frontend:**
    The application will be available at `http://localhost:3000`.
    ```bash
    pnpm --filter ./packages/nextjs-showcase dev
    ```

### Deploying Your Own Version

1.  **Deploy the Smart Contract:**
    *   Create a `.env` file in `packages/hardhat/` and add your private key:
        ```
        PRIVATE_KEY=your_private_key_here
        ```
    *   Deploy the contract to Sepolia:
        ```bash
        cd packages/hardhat
        pnpm exec hardhat deploy --network sepolia
        ```
    *   Verify the contract (required for Zama Relayer):
        ```bash
        pnpm exec hardhat verify --network sepolia <YOUR_CONTRACT_ADDRESS>
        ```

2.  **Update Frontend Configuration:**
    *   Update the `CONTRACT_ADDRESS` in `packages/nextjs-showcase/app/components/GamePage.tsx` with your newly deployed contract address.
    *   Also update the contract address in `packages/nextjs-showcase/app/components/HomePage.tsx`.

3.  **Deploy the Frontend:**
    *   The frontend is ready for deployment on platforms like Vercel or Netlify. Connect your GitHub repository for a seamless deployment experience.

## Acknowledgments

Powered by Zama's FHEVM.
