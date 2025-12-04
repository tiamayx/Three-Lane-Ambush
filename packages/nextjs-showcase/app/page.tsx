"use client";

import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { createInstance, SepoliaConfig, initSDK, FhevmInstance } from '@zama-fhe/relayer-sdk/web';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import WalletModal from './components/WalletModal';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
      reconnectWallet();
    }

    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (account && accounts[0] !== account) {
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
          relayerUrl: 'https://relayer.testnet.zama.org',
        });
        setInstance(fhevmInstance);
        setConnectionStatus('success');
        localStorage.setItem('walletAccount', userAddress);
      }
    } catch {
      setConnectionStatus('error');
    }
  };

  const connectWallet = async () => {
    setShowWalletModal(true);
  };

  const handleSelectWallet = async (provider: string) => {
    setShowWalletModal(false);
    
    let ethereum: any;
    const windowEth = window.ethereum as any;
    
    if (provider === 'metamask') {
      ethereum = windowEth?.providers?.find((p: any) => p.isMetaMask) || window.ethereum;
    } else if (provider === 'okx') {
      ethereum = (window as any).okxwallet || windowEth?.providers?.find((p: any) => p.isOkxWallet);
    } else if (provider === 'coinbase') {
      ethereum = windowEth?.providers?.find((p: any) => p.isCoinbaseWallet);
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
        relayerUrl: 'https://relayer.testnet.zama.org',
      });
      setInstance(fhevmInstance);
      setConnectionStatus('success');
      localStorage.setItem('walletAccount', userAddress);
    } catch (e: unknown) {
      const err = e as { code?: number; message?: string };
      if (err.code === 4001 || err.message?.includes('User rejected')) {
        return;
      }
      setConnectionStatus('error');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setInstance(null);
    setSigner(null);
    setConnectionStatus('idle');
    localStorage.removeItem('walletAccount');
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
