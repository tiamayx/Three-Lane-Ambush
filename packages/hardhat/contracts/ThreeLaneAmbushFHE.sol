// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./lib/lib/FHE.sol";
import "./lib/config/ZamaConfig.sol";

/**
 * @title ThreeLaneAmbushFHE
 * @notice A privacy-preserving strategy game using Fully Homomorphic Encryption (FHE)
 * @dev Players choose a lane (1-3) and power (1-9). The contract generates a computer move
 *      and determines the winner using encrypted computation. Only the final result 
 *      (Win/Draw/Loss) is revealed to the player.
 */
contract ThreeLaneAmbushFHE is SepoliaConfig {
    // Mapping from address to the encrypted outcome (0 = Loss, 1 = Draw, 2 = Win)
    mapping(address => euint8) private encryptedResults;

    event GameResultReady(address indexed player);

    /// @notice Play a single round against the computer.
    /// @param laneHandle Encrypted lane selection (1 = Left, 2 = Center, 3 = Right)
    /// @param laneProof Merkle-style proof attached to the encrypted lane
    /// @param powerHandle Encrypted power level (1-9)
    /// @param powerProof Merkle-style proof attached to the encrypted power
    function play(
        externalEuint8 laneHandle,
        bytes calldata laneProof,
        externalEuint8 powerHandle,
        bytes calldata powerProof
    ) external {
        euint8 playerLane = FHE.fromExternal(laneHandle, laneProof);
        euint8 playerPower = FHE.fromExternal(powerHandle, powerProof);

        // Generate computer choices in-circuit and clamp to the required ranges.
        euint8 computerLane = FHE.add(FHE.rem(FHE.randEuint8(), uint8(3)), FHE.asEuint8(uint8(1)));
        euint8 computerPower = FHE.add(FHE.rem(FHE.randEuint8(), uint8(9)), FHE.asEuint8(uint8(1)));

        ebool sameLane = FHE.eq(playerLane, computerLane);
        euint8 encounterResult = FHE.select(
            sameLane,
            _resolveSameLane(playerPower, computerPower),
            FHE.asEuint8(uint8(1)) // Different lanes → Draw
        );

        // Persist encrypted outcome and authorise the sender to decrypt it client-side.
        encounterResult = FHE.allow(encounterResult, msg.sender);
        encounterResult = FHE.allowThis(encounterResult);
        encryptedResults[msg.sender] = encounterResult;

        emit GameResultReady(msg.sender);
    }

    function _resolveSameLane(euint8 playerPower, euint8 computerPower) internal returns (euint8) {
        ebool draws = FHE.eq(playerPower, computerPower);
        ebool wins = FHE.gt(playerPower, computerPower);

        return FHE.select(
            draws,
            FHE.asEuint8(uint8(1)),
            FHE.select(wins, FHE.asEuint8(uint8(2)), FHE.asEuint8(uint8(0)))
        );
    }

    /// @notice Fetch the encrypted outcome handle (authorised for the caller during `play`).
    function getEncryptedResult(address player) external view returns (bytes32) {
        return FHE.toBytes32(encryptedResults[player]);
    }
}
