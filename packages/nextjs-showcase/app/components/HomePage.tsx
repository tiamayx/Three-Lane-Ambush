"use client";

import React from 'react';

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

interface HomePageProps {
  account: string | null;
  connectionStatus: 'idle' | 'success' | 'error';
  connectWallet: () => void;
  disconnectWallet: () => void;
  goToGame: () => void;
}

export default function HomePage({ account, connectionStatus, connectWallet, disconnectWallet, goToGame }: HomePageProps) {
  const [copied, setCopied] = React.useState(false);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24 p-4 sm:p-8 bg-black text-slate-200 font-mono relative overflow-hidden">
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
      <div className="absolute top-0 left-0 right-0 bg-green-950/95 backdrop-blur-sm border-b-2 border-yellow-700/70 px-4 py-3 flex items-center justify-end z-10" style={{ boxShadow: '0 2px 0 rgba(133, 77, 14, 0.5)' }}>
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
                onClick={disconnectWallet} 
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

      {/* Main Content */}
      <div className="w-full max-w-6xl relative z-0 mt-16 mb-6 space-y-8 px-4">
        {/* Hero Section */}
        <div className="text-center space-y-5 flex flex-col items-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-yellow-600 tracking-widest uppercase drop-shadow-lg whitespace-nowrap inline-block" style={{ textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9), 0 0 30px rgba(202, 138, 4, 0.4)' }}>
            ⚔ Three Lane Ambush ⚔
          </h1>
          <p className="text-lg sm:text-xl text-stone-400 uppercase tracking-wide font-semibold">
            [ CLASSIFIED TACTICAL OPERATION ]
          </p>
          <div className="h-1 w-64 bg-gradient-to-r from-transparent via-yellow-700 to-transparent" />
        </div>

        {/* Mission Brief */}
        <div className="bg-green-950/90 backdrop-blur-sm border-4 border-yellow-700/80 shadow-2xl shadow-black/70 p-8 relative" style={{ 
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.7), 0 4px 8px rgba(0,0,0,0.8)',
          borderStyle: 'double'
        }}>
          {/* Military Corner Bolts - Brass */}
          <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-yellow-700 border-2 border-yellow-900" style={{ boxShadow: 'inset 0 1px 2px rgba(255,220,100,0.3), 0 1px 2px rgba(0,0,0,0.8)' }}></div>
          <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-yellow-700 border-2 border-yellow-900" style={{ boxShadow: 'inset 0 1px 2px rgba(255,220,100,0.3), 0 1px 2px rgba(0,0,0,0.8)' }}></div>
          <div className="absolute bottom-1 left-1 w-3 h-3 rounded-full bg-yellow-700 border-2 border-yellow-900" style={{ boxShadow: 'inset 0 1px 2px rgba(255,220,100,0.3), 0 1px 2px rgba(0,0,0,0.8)' }}></div>
          <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-yellow-700 border-2 border-yellow-900" style={{ boxShadow: 'inset 0 1px 2px rgba(255,220,100,0.3), 0 1px 2px rgba(0,0,0,0.8)' }}></div>
          
          <div className="bg-gradient-to-r from-green-950 via-yellow-950/30 to-green-950 border-b-3 border-yellow-700/80 px-6 py-4 -mx-8 -mt-8 mb-6 relative" style={{ borderBottomWidth: '3px', boxShadow: '0 2px 0 rgba(133, 77, 14, 0.6)' }}>
            {/* Header Rivets - Brass */}
            <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 1px 1px rgba(255,220,100,0.4)' }}></div>
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 1px 1px rgba(255,220,100,0.4)' }}></div>
            <h2 className="text-3xl font-bold text-yellow-600 uppercase tracking-widest flex items-center justify-center gap-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9)' }}>
              <span className="text-yellow-700">▶</span> MISSION BRIEF <span className="text-yellow-700">◀</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300">
            {/* Left: OBJECTIVE */}
            <div className="bg-green-900/80 border-2 border-yellow-700/70 p-6 flex flex-col relative" style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.6)' }}>
              {/* Corner Rivets - Steel */}
              <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.3)' }}></div>
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.3)' }}></div>
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.3)' }}></div>
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.3)' }}></div>
              
              <h3 className="text-yellow-600 font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-base" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}>
                <span className="text-yellow-700">●</span> OBJECTIVE
              </h3>
              <p className="text-base leading-relaxed">
                Deploy your forces across three strategic lanes to intercept enemy units. Choose your attack vector wisely and allocate sufficient force to ensure mission success.
              </p>
            </div>

            {/* Center: RULES OF ENGAGEMENT */}
            <div className="bg-green-900/80 border-2 border-yellow-700/70 p-6 flex flex-col relative" style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.6)' }}>
              {/* Corner Rivets - Copper */}
              <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.3)' }}></div>
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.3)' }}></div>
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.3)' }}></div>
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.3)' }}></div>
              
              <h3 className="text-yellow-600 font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-base" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}>
                <span className="text-yellow-700">●</span> RULES
              </h3>
              <ul className="text-base space-y-2.5 list-none">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong className="text-slate-200">WIN:</strong> Same lane, higher force</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">◆</span>
                  <span><strong className="text-slate-200">DRAW:</strong> Different lanes or equal force</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✗</span>
                  <span><strong className="text-slate-200">LOSS:</strong> Same lane, lower force</span>
                </li>
              </ul>
            </div>

            {/* Right: TECHNOLOGY */}
            <div className="bg-green-900/80 border-2 border-yellow-700/70 p-6 flex flex-col relative" style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.6)' }}>
              {/* Corner Rivets - Copper */}
              <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.3)' }}></div>
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.3)' }}></div>
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.3)' }}></div>
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-600 border border-yellow-800" style={{ boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.3)' }}></div>
              
              <h3 className="text-yellow-600 font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-base" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}>
                <span className="text-yellow-700">●</span> TECHNOLOGY
              </h3>
              <p className="text-base leading-relaxed">
                Powered by <strong className="text-yellow-600 whitespace-nowrap">Zama FHEVM Protocol</strong> on Ethereum Sepolia Testnet. All data is computed on encrypted state, ensuring complete strategic confidentiality.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4">
          <Button
            onClick={goToGame}
            disabled={!account}
            className={`text-xl font-bold uppercase tracking-widest px-12 py-6 border-4 transition-all ${
              !account
                ? 'bg-stone-800 border-stone-700 text-stone-600 cursor-not-allowed'
                : 'bg-gradient-to-b from-red-800 to-red-900 border-red-700 text-yellow-100 hover:from-red-700 hover:to-red-800'
            }`}
            style={account ? { 
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
              boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.7)',
              borderStyle: 'solid'
            } : {}}
          >
            ⚔ START BATTLE ⚔
          </Button>
        </div>

        {!account ? (
          <p className="text-center text-yellow-600 text-sm uppercase tracking-wider font-bold animate-pulse mt-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}>
            ⚠ CONNECT WALLET TO BEGIN OPERATION
          </p>
        ) : (
          <p className="text-center mt-4 animate-pulse text-lg text-yellow-300 font-mono tracking-wider">
            WALLET CONNECTED • READY FOR OPERATION
          </p>
        )}
      </div>

      <footer className="absolute bottom-4 inset-x-0 flex flex-col items-center justify-center space-y-2 px-4 text-center">
        <div className="text-xs font-mono tracking-widest text-yellow-700/80">
          <p>
            Verified Contract on Sepolia:{" "}
            <a
              href="https://sepolia.etherscan.io/address/0x890c4505722612fa62931233279776AE64ef9AD4"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-yellow-600"
            >
              0x890c4505722612fa62931233279776AE64ef9AD4
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

