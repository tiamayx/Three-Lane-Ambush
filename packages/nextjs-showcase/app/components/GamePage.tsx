"use client";

import React, { useState, useEffect } from 'react';
import { Contract, getBytes, hexlify } from 'ethers';
import { FhevmInstance } from '@zama-fhe/relayer-sdk/web';

// --- START: Inlined ABI ---
const contractAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "GameResultReady",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getEncryptedResult",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "externalEuint8",
        "name": "laneHandle",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "laneProof",
        "type": "bytes"
      },
      {
        "internalType": "externalEuint8",
        "name": "powerHandle",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "powerProof",
        "type": "bytes"
      }
    ],
    "name": "play",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "protocolId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  }
];
// --- END: Inlined ABI ---

const CONTRACT_ADDRESS = "0x3A31FecA5759C9e7F819f707FCAF50019084077f";

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    return (
      <button
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-700 hover:bg-gray-600 h-10 px-4 py-2 ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

interface GamePageProps {
  account: string | null;
  instance: FhevmInstance | null;
  signer: any;
  connectionStatus: 'idle' | 'success' | 'error';
  connectWallet: () => void;
  disconnectWallet: () => void;
  goToHome: () => void;
}

export default function GamePage({ 
  account, 
  instance, 
  signer, 
  connectionStatus, 
  connectWallet, 
  disconnectWallet, 
  goToHome 
}: GamePageProps) {
  const [lane, setLane] = useState<'Left' | 'Center' | 'Right' | null>(null);
  const [power, setPower] = useState(5);
  const [result, setResult] = useState<'Win' | 'Draw' | 'Loss' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [contract, setContract] = useState<Contract | null>(null);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Initialize contract when signer is available
  useEffect(() => {
    if (signer && account) {
      const contractInstance = new Contract(CONTRACT_ADDRESS, contractAbi, signer);
      setContract(contractInstance);
    }
  }, [signer, account]);

  // Wrapper function to handle disconnect and reset game state
  const handleDisconnect = () => {
    // Reset all game parameters
    setLane(null);
    setPower(5);
    setResult(null);
    setIsLoading(false);
    setLoadingStep('');
    setContract(null);
    
    // Call parent disconnect
    disconnectWallet();
  };

  // Listen for wallet disconnect events
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet - trigger disconnect with reset
          handleDisconnect();
        }
      };

      if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      }

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [disconnectWallet]);

  // Reset result when lane or power changes
  const handleLaneChange = (newLane: 'Left' | 'Center' | 'Right') => {
    setLane(newLane);
    // Only reset power if result is already displayed
    if (result) {
      setPower(5);
    }
    setResult(null);
  };

  const handlePowerChange = (newPower: number) => {
    setPower(newPower);
    // Only reset lane if result is already displayed
    if (result) {
      setLane(null);
    }
    setResult(null);
  };

  // Reset game state when returning to home
  const handleGoToHome = () => {
    setLane(null);
    setPower(5);
    setResult(null);
    setIsLoading(false);
    setLoadingStep('');
    goToHome();
  };

  const handleEngage = async () => {
    // Check if wallet is connected and FHEVM is initialized
    if (!account || !signer || !instance || !contract) {
      // Silently return - the UI already shows "LINK FAILED" status
      return;
    }
    if (!lane) {
      alert("Please select an attack vector (lane) first.");
      return;
    }
    setIsLoading(true);
    setResult(null);
    setLoadingStep('');

    try {
      const playerLane = lane === 'Left' ? 1 : lane === 'Center' ? 2 : 3;
      const playerPower = power;
      
      setLoadingStep('🔐 Encrypting your tactical data...');
      console.log('🎮 Encrypting player move...');
      
      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, account);
      input.add8(playerLane);
      input.add8(playerPower);
      const encrypted = await input.encrypt();
      
      setLoadingStep('📡 Broadcasting encrypted operation...');
      console.log('📤 Sending transaction with encrypted inputs...');
      
      const laneHandle = hexlify(encrypted.handles[0]);
      const powerHandle = hexlify(encrypted.handles[1]);
      const inputProof = hexlify(encrypted.inputProof);
      
      console.log('Lane handle (hex):', laneHandle);
      console.log('Power handle (hex):', powerHandle);
      console.log('Input proof length:', inputProof.length);
      
      const tx = await contract.play(
        laneHandle,
        inputProof,
        powerHandle,
        inputProof
      );
      console.log('Transaction sent:', tx.hash);
      
      setLoadingStep('⏳ Awaiting blockchain confirmation...');
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt);
      
      setLoadingStep('📥 Retrieving encrypted result...');
      console.log('🔐 Fetching encrypted result...');
      const encryptedResultHandle = await contract.getEncryptedResult(account);
      const encryptedResultBytes = getBytes(encryptedResultHandle);
      const encryptedResultHex = hexlify(encryptedResultBytes);
      console.log('Encrypted result handle:', encryptedResultHex);
      
      setLoadingStep('🔓 Decrypting mission outcome...');
      console.log('🔓 Decrypting result locally with user permission...');
      const keypair = instance.generateKeypair();
      const startTimestamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "7";
      const contractAddresses = [CONTRACT_ADDRESS];
      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimestamp,
        durationDays
      );

      const signature = await signer.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        eip712.message
      );

      const decryptedResults = await instance.userDecrypt(
        [
          {
            handle: encryptedResultBytes,
            contractAddress: CONTRACT_ADDRESS,
          },
        ],
        keypair.privateKey,
        keypair.publicKey,
        signature.replace(/^0x/, ""),
        contractAddresses,
        account,
        startTimestamp,
        durationDays
      );

      const decryptedResult = Number(
        decryptedResults[encryptedResultHex] ?? decryptedResults[hexlify(encryptedResultBytes)]
      );
      
      let outcome: 'Win' | 'Draw' | 'Loss';
      if (decryptedResult === 2) {
        outcome = 'Win';
      } else if (decryptedResult === 1) {
        outcome = 'Draw';
      } else {
        outcome = 'Loss';
      }
      
      console.log('🎯 Final result:', outcome);
      setResult(outcome);
      
    } catch (e: any) {
      // Handle user rejection gracefully
      if (e.code === 4001 || e.code === 'ACTION_REJECTED' || e.message?.includes('user rejected') || e.message?.includes('User denied')) {
        console.log('ℹ️ User cancelled transaction');
        // Don't show error alert for user cancellation
      } else {
        console.error("❌ Engagement failed", e);
        alert(`Engagement failed: ${e.message || 'See console for details'}`);
      }
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-16 bg-black text-slate-200 font-mono relative overflow-hidden">
      {/* Foggy Military Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-950 via-black to-green-950" />
      
      {/* Fog Effect with Military Green Tint */}
      <div className="absolute inset-0 opacity-25" style={{
        backgroundImage: `
          radial-gradient(ellipse at 30% 20%, rgba(34, 60, 40, 0.5) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 60%, rgba(28, 50, 35, 0.4) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 80%, rgba(20, 40, 25, 0.6) 0%, transparent 50%)
        `
      }} />
      
      {/* Military Grid Background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />
      
      {/* Top Status Bar */}
      <div className="absolute top-0 left-0 right-0 bg-green-950/95 backdrop-blur-sm border-b-2 border-yellow-700/70 px-4 py-3 flex items-center justify-between z-10" style={{ boxShadow: '0 2px 0 rgba(133, 77, 14, 0.4)' }}>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleGoToHome}
            className="text-yellow-600 font-bold text-sm tracking-widest uppercase hover:text-yellow-500 bg-stone-900/50 hover:bg-stone-800/70 border-2 border-yellow-800/50"
            style={{ boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)', textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}
          >
            ← BACK TO HOME
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Connection Status Indicator */}
          {connectionStatus !== 'idle' && (
            <div className="flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded border border-slate-800">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'success' 
                  ? 'bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50' 
                  : 'bg-red-600 animate-pulse shadow-lg shadow-red-600/50'
              }`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${
                connectionStatus === 'success' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {connectionStatus === 'success' ? 'FHEVM INITIALIZED' : 'LINK FAILED'}
              </span>
            </div>
          )}
          
          {/* Wallet Address or Connect Button */}
          {account ? (
            <div className="flex items-center gap-2">
              <button
                onClick={copyAddress}
                className="bg-stone-900 border-2 border-yellow-700/70 text-yellow-200 text-xs font-bold px-3 py-1.5 tracking-wider hover:bg-stone-800 hover:border-yellow-600 transition-all cursor-pointer relative"
                style={{ boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)' }}
                title="Click to copy full address"
              >
                {copied ? (
                  <span className="text-emerald-400">✓ COPIED!</span>
                ) : (
                  `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
                )}
              </button>
              <Button 
                onClick={handleDisconnect} 
                className="bg-stone-800 border-2 border-red-900/70 text-red-200 hover:bg-stone-700 text-xs font-bold px-3 py-1.5 h-auto uppercase tracking-wider"
                style={{ boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)' }}
              >
                ✕ DISCONNECT
              </Button>
            </div>
          ) : (
            <Button onClick={connectWallet} className="bg-yellow-800 border-2 border-yellow-700 text-stone-100 hover:bg-yellow-700 font-bold uppercase tracking-wider" style={{ boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)' }}>
              ⚡ CONNECT WALLET
            </Button>
          )}
        </div>
      </div>

      {/* Main Command Panel */}
      <div className="w-full max-w-2xl bg-green-950/90 backdrop-blur-sm border-4 border-yellow-700/80 shadow-2xl shadow-black/70 relative z-0 mt-8" style={{ 
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.7), 0 4px 8px rgba(0,0,0,0.8)',
        borderStyle: 'solid'
      }}>
        {/* Military Corner Bolts - Copper */}
        <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-yellow-700 border-2 border-yellow-900" style={{ boxShadow: 'inset 0 1px 2px rgba(255,220,100,0.3), 0 1px 2px rgba(0,0,0,0.8)' }}></div>
        <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-yellow-700 border-2 border-yellow-900" style={{ boxShadow: 'inset 0 1px 2px rgba(255,220,100,0.3), 0 1px 2px rgba(0,0,0,0.8)' }}></div>
        <div className="absolute bottom-1 left-1 w-3 h-3 rounded-full bg-yellow-700 border-2 border-yellow-900" style={{ boxShadow: 'inset 0 1px 2px rgba(255,220,100,0.3), 0 1px 2px rgba(0,0,0,0.8)' }}></div>
        <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-yellow-700 border-2 border-yellow-900" style={{ boxShadow: 'inset 0 1px 2px rgba(255,220,100,0.3), 0 1px 2px rgba(0,0,0,0.8)' }}></div>
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-green-950 via-yellow-950/30 to-green-950 border-b-3 border-yellow-700/80 px-6 py-4 relative" style={{ borderBottomWidth: '3px', boxShadow: '0 2px 0 rgba(133, 77, 14, 0.4)' }}>
          {/* Header Rivets - Copper */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 1px 1px rgba(255,220,100,0.4)' }}></div>
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 1px 1px rgba(255,220,100,0.4)' }}></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-yellow-600 tracking-widest uppercase drop-shadow-lg" style={{ textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9), 0 0 30px rgba(202, 138, 4, 0.4)' }}>
            ⚔ Three Lane Ambush ⚔
          </h1>
          <p className="text-center text-stone-400 mt-2 text-sm uppercase tracking-wide font-semibold">
            [ CLASSIFIED OPERATION - FHE ENCRYPTED ]
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Lane Selection */}
          <div className="bg-green-900/80 border-2 border-yellow-700/70 p-5 rounded relative" style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.6)' }}>
            {/* Corner Rivets - Copper */}
            <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,220,100,0.4)' }}></div>
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,220,100,0.4)' }}></div>
            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,220,100,0.4)' }}></div>
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,220,100,0.4)' }}></div>
            
            <h2 className="text-base font-bold mb-4 text-yellow-600 uppercase tracking-widest flex items-center gap-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}>
              <span className="text-yellow-700">▶</span> SELECT ATTACK VECTOR
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {(['Left', 'Center', 'Right'] as const).map((l) => (
                <Button
                  key={l}
                  onClick={() => handleLaneChange(l)}
                  className={`w-full py-4 font-bold uppercase tracking-wider border-2 transition-all ${
                    lane === l 
                      ? 'bg-yellow-800 border-yellow-700 text-stone-100 shadow-lg shadow-yellow-800/50' 
                      : 'bg-stone-800 border-stone-600 text-stone-300 hover:bg-stone-700 hover:border-stone-500'
                  }`}
                >
                  {l === 'Left' && '◄ LEFT'}
                  {l === 'Center' && '● CENTER'}
                  {l === 'Right' && '► RIGHT'}
                </Button>
              ))}
            </div>
          </div>

          {/* Power Selection */}
          <div className="bg-green-900/80 border-2 border-yellow-700/70 p-5 rounded relative" style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.6)' }}>
            {/* Corner Rivets - Copper */}
            <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,220,100,0.4)' }}></div>
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,220,100,0.4)' }}></div>
            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,220,100,0.4)' }}></div>
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,220,100,0.4)' }}></div>
            
            <h2 className="text-base font-bold mb-4 text-yellow-600 uppercase tracking-widest flex items-center gap-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}>
              <span className="text-yellow-700">▶</span> DEPLOY FORCE LEVEL
            </h2>
            <div className="flex items-center gap-4">
              <div className="bg-black border border-yellow-800/60 px-4 py-2 rounded">
                <span className="text-2xl font-bold text-yellow-600">{power}</span>
              </div>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="1"
                  max="9"
                  value={power}
                  onChange={(e) => handlePowerChange(parseInt(e.target.value, 10))}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-xs text-slate-500 font-bold">
                  <span>MIN</span>
                  <span>MAX</span>
                </div>
              </div>
            </div>
          </div>

          {/* Engage Button */}
          <Button
            onClick={handleEngage}
            disabled={!account || isLoading || !lane}
            className={`w-full py-6 font-bold text-xl uppercase tracking-widest border-4 transition-all ${
              !account || isLoading || !lane
                ? 'bg-stone-800 border-stone-700 text-stone-600 cursor-not-allowed'
                : 'bg-gradient-to-b from-red-800 to-red-900 border-red-700 text-yellow-100 hover:from-red-700 hover:to-red-800'
            } ${isLoading ? 'bg-red-950 border-red-700 text-white' : ''}`}
            style={
              !account || !lane 
                ? {} 
                : { 
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                    boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.7)',
                    borderStyle: 'solid'
                  }
            }
          >
            <span className={isLoading ? 'animate-pulse text-white' : ''} style={isLoading ? { textShadow: '0 0 15px rgba(255, 255, 255, 0.8)' } : {}}>
              {isLoading ? '⚡ ENGAGING TARGET...' : '⚔ EXECUTE OPERATION ⚔'}
            </span>
          </Button>

          {/* Loading Steps Display */}
          {isLoading && loadingStep && (
            <div className="bg-black/80 border border-yellow-800/60 p-4 rounded text-center" style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.7)' }}>
              <p className="text-yellow-300 text-sm font-bold uppercase tracking-wider animate-pulse" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}>
                {loadingStep}
              </p>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className={`p-6 rounded border-4 text-center relative overflow-hidden ${
              result === 'Win' 
                ? 'bg-green-900/80 border-yellow-700' 
                : result === 'Draw'
                ? 'bg-green-900/70 border-stone-600'
                : 'bg-red-950/80 border-red-700'
            }`} style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.7), 0 4px 8px rgba(0,0,0,0.8)' }}>
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: result === 'Win' 
                  ? 'radial-gradient(circle, rgba(202, 138, 4, 0.3) 0%, transparent 70%)'
                  : result === 'Draw'
                  ? 'radial-gradient(circle, rgba(120, 113, 108, 0.2) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(220, 38, 38, 0.4) 0%, transparent 70%)'
              }} />
              <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-70 text-stone-400">
                [ MISSION STATUS ]
              </div>
              <h3 className="text-4xl font-bold uppercase tracking-widest relative z-10 flex items-center justify-center gap-2" style={{
                textShadow: result === 'Win' 
                  ? '2px 2px 4px rgba(0, 0, 0, 0.9)' 
                  : result === 'Draw'
                  ? '2px 2px 4px rgba(0, 0, 0, 0.9)'
                  : '2px 2px 4px rgba(0, 0, 0, 0.9), 0 0 20px rgba(220, 38, 38, 0.5)'
              }}>
                {result === 'Win' && <><span className="text-yellow-600">✓</span><span className="text-yellow-600">WIN</span></>}
                {result === 'Draw' && <><span className="text-stone-400">◆</span><span className="text-stone-400">DRAW</span></>}
                {result === 'Loss' && <><span className="text-red-600">✗</span><span className="text-red-600">LOSS</span></>}
              </h3>
            </div>
          )}
        </div>
      </div>

      <footer className="absolute bottom-4 inset-x-0 flex flex-col items-center justify-center space-y-2 px-4 text-center">
        <div className="text-xs font-mono tracking-widest text-yellow-700/80">
          <p>
            Verified Contract on Sepolia:{" "}
            <a
              href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-yellow-600"
            >
              {CONTRACT_ADDRESS}
            </a>
          </p>
        </div>
        <div className="text-xs font-mono tracking-widest text-yellow-700/80">
          <p>ENCRYPTED BATTLEFIELD SIMULATION • ZAMA FHEVM PROTOCOL</p>
        </div>
      </footer>
      
      {/* GitHub Link */}
      <a
        href="https://github.com/tiamayx/Three-Lane-Ambush"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 p-3 bg-[#24292e] hover:bg-[#1a1e22] rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        aria-label="View on GitHub"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      </a>
    </main>
  );
}

