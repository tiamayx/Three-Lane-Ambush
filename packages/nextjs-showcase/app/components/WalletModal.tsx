"use client";

import React from 'react';

interface WalletOption {
  name: string;
  provider: string;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (provider: string) => void;
}

const wallets: WalletOption[] = [
  {
    name: 'MetaMask',
    provider: 'metamask'
  },
  {
    name: 'OKX Wallet',
    provider: 'okx'
  },
  {
    name: 'Coinbase Wallet',
    provider: 'coinbase'
  },
  {
    name: 'WalletConnect',
    provider: 'walletconnect'
  }
];

export default function WalletModal({ isOpen, onClose, onSelectWallet }: WalletModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-green-950/95 border-4 border-yellow-700/80 shadow-2xl max-w-md w-full" style={{
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.7), 0 8px 16px rgba(0,0,0,0.9)',
        borderStyle: 'double'
      }}>
        {/* Corner Bolts */}
        <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-yellow-700 border-2 border-yellow-900" style={{ boxShadow: 'inset 0 1px 2px rgba(255,220,100,0.3), 0 1px 2px rgba(0,0,0,0.8)' }}></div>
        <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-yellow-700 border-2 border-yellow-900" style={{ boxShadow: 'inset 0 1px 2px rgba(255,220,100,0.3), 0 1px 2px rgba(0,0,0,0.8)' }}></div>
        <div className="absolute bottom-1 left-1 w-3 h-3 rounded-full bg-yellow-700 border-2 border-yellow-900" style={{ boxShadow: 'inset 0 1px 2px rgba(255,220,100,0.3), 0 1px 2px rgba(0,0,0,0.8)' }}></div>
        <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-yellow-700 border-2 border-yellow-900" style={{ boxShadow: 'inset 0 1px 2px rgba(255,220,100,0.3), 0 1px 2px rgba(0,0,0,0.8)' }}></div>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-950 via-yellow-950/30 to-green-950 border-b-3 border-yellow-700/80 px-6 py-4 relative" style={{ borderBottomWidth: '3px', boxShadow: '0 2px 0 rgba(133, 77, 14, 0.6)' }}>
          {/* Header Rivets */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 1px 1px rgba(255,220,100,0.4)' }}></div>
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 1px 1px rgba(255,220,100,0.4)' }}></div>
          
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-yellow-600 uppercase tracking-widest" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9)' }}>
              SELECT WALLET
            </h2>
            <button
              onClick={onClose}
              className="text-yellow-600 hover:text-yellow-500 text-2xl font-bold leading-none transition-colors"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Wallet Options */}
        <div className="p-6 space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.provider}
              onClick={() => onSelectWallet(wallet.provider)}
              className="w-full bg-green-900/80 border-2 border-yellow-700/70 hover:border-yellow-600 hover:bg-green-800/90 p-4 transition-all group relative"
              style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.6)' }}
            >
              {/* Button Corner Rivets */}
              <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,220,100,0.4)' }}></div>
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,220,100,0.4)' }}></div>
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,220,100,0.4)' }}></div>
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,220,100,0.4)' }}></div>
              
              <div className="text-center text-xl font-bold text-yellow-600 uppercase tracking-wider group-hover:text-yellow-500 transition-colors" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}>
                {wallet.name}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-yellow-700/50 px-6 py-4 bg-green-950/50">
          <p className="text-xs text-stone-500 text-center uppercase tracking-wider">
            ⚠ ENSURE YOUR WALLET IS CONNECTED TO SEPOLIA TESTNET
          </p>
        </div>
      </div>
    </div>
  );
}

