"use client";

import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { createInstance, SepoliaConfig, initSDK, FhevmInstance } from '@zama-fhe/relayer-sdk/web';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import WalletModal from './components/WalletModal';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'home' | 'game'>('home');
  const [account, setAccount] = useState<string | null>(null);
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [signer, setSigner] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Restore page state and wallet connection on mount
  useEffect(() => {
    const savedPage = localStorage.getItem('currentPage') as 'home' | 'game' | null;
    if (savedPage) {
      setCurrentPage(savedPage);
    }

    const savedAccount = localStorage.getItem('walletAccount');
    if (savedAccount && typeof window.ethereum !== 'undefined') {
      // Attempt to reconnect wallet
      reconnectWallet();
    }

    // Listen for wallet disconnection events
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // Wallet disconnected
          disconnectWallet();
        } else if (account && accounts[0] !== account) {
          // Account switched - reconnect with new account
          reconnectWallet();
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
  }, [account]);

  const reconnectWallet = async () => {
    try {
      if (!window.ethereum) return;
      
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const signerInstance = await provider.getSigner();
        const userAddress = await signerInstance.getAddress();
        setAccount(userAddress);
        setSigner(signerInstance);
        
        await initSDK();
        
        const fhevmInstance = await createInstance({
          ...SepoliaConfig,
          network: 'https://eth-sepolia.g.alchemy.com/v2/PdDY0FCflhQnCiLhEwxih',
        });
        setInstance(fhevmInstance);
        setConnectionStatus('success');
        
        localStorage.setItem('walletAccount', userAddress);
        console.log('✅ Wallet reconnected automatically');
      }
    } catch (e) {
      console.log('ℹ️ Could not reconnect wallet automatically');
      localStorage.removeItem('walletAccount');
    }
  };

  const connectWallet = async () => {
    setShowWalletModal(true);
  };

  const handleSelectWallet = async (provider: string) => {
    setShowWalletModal(false);
    
    let ethereum: any;
    
    // Detect different wallet providers
    if (provider === 'metamask') {
      ethereum = window.ethereum?.providers?.find((p: any) => p.isMetaMask) || window.ethereum;
    } else if (provider === 'okx') {
      ethereum = window.okxwallet || window.ethereum?.providers?.find((p: any) => p.isOkxWallet);
    } else if (provider === 'coinbase') {
      ethereum = window.ethereum?.providers?.find((p: any) => p.isCoinbaseWallet);
    } else {
      ethereum = window.ethereum;
    }
    
    if (!ethereum) {
      alert(`Please install ${provider === 'metamask' ? 'MetaMask' : provider === 'okx' ? 'OKX Wallet' : provider === 'coinbase' ? 'Coinbase Wallet' : 'a Web3 wallet'}!`);
      setConnectionStatus('error');
      return;
    }
    
    try {
      await ethereum.request({ method: 'eth_requestAccounts' });
      
      const browserProvider = new BrowserProvider(ethereum);
      const signerInstance = await browserProvider.getSigner();
      const userAddress = await signerInstance.getAddress();
      setAccount(userAddress);
      setSigner(signerInstance);
      
      await initSDK();
      
      const fhevmInstance = await createInstance({
        ...SepoliaConfig,
        network: 'https://eth-sepolia.g.alchemy.com/v2/PdDY0FCflhQnCiLhEwxih',
      });
      setInstance(fhevmInstance);

      console.log('✅ Wallet connected and FHEVM initialized');
      setConnectionStatus('success');
      localStorage.setItem('walletAccount', userAddress);
    } catch (e: any) {
      if (e.code === 4001 || e.message?.includes('User rejected')) {
        console.log('ℹ️ User cancelled wallet connection');
        return;
      }
      
      console.error("Failed to connect wallet", e);
      alert("Failed to connect wallet. See console for details.");
      setConnectionStatus('error');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setInstance(null);
    setSigner(null);
    setConnectionStatus('idle');
    localStorage.removeItem('walletAccount');
    console.log('🔌 Wallet disconnected');
  };

  const goToGame = () => {
    setCurrentPage('game');
    localStorage.setItem('currentPage', 'game');
  };

  const goToHome = () => {
    setCurrentPage('home');
    localStorage.setItem('currentPage', 'home');
  };

  return (
    <>
      {currentPage === 'home' ? (
        <HomePage
          account={account}
          connectionStatus={connectionStatus}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
          goToGame={goToGame}
        />
      ) : (
        <GamePage
          account={account}
          instance={instance}
          signer={signer}
          connectionStatus={connectionStatus}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
          goToHome={goToHome}
        />
      )}
      
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSelectWallet={handleSelectWallet}
      />
    </>
  );
}
