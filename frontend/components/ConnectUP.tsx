'use client';

import { useUP } from '@/hooks/useUP';
import { LUKSO_TESTNET, formatAddress } from '@/lib/contracts';
import { Wallet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export function ConnectUP() {
  const { 
    isConnected, 
    isConnecting, 
    account, 
    chainId, 
    isCorrectChain,
    connect, 
    disconnect 
  } = useUP();

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Wallet className="w-5 h-5 text-lukso-pink" />
          Universal Profile
        </h2>
        {isConnected && (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isCorrectChain ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm text-gray-400">
              {isCorrectChain ? 'Connected' : 'Wrong Network'}
            </span>
          </div>
        )}
      </div>

      {!isConnected ? (
        <div className="text-center py-6">
          <p className="text-gray-400 mb-6">
            Connect your Universal Profile to interact with the Agent Social Framework
          </p>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="btn-glow bg-lukso-gradient text-white font-semibold py-3 px-8 rounded-full flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Connect UP
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Connected Address</p>
            <p className="font-mono text-lg">{formatAddress(account || '')}</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Network</p>
            <div className="flex items-center gap-2">
              {isCorrectChain ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{LUKSO_TESTNET.name}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500">
                    Wrong Network (Chain ID: {chainId})
                  </span>
                </>
              )}
            </div>
          </div>

          {!isCorrectChain && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-400">
                Please switch to {LUKSO_TESTNET.name} (Chain ID: {LUKSO_TESTNET.chainId}) in your Universal Profile extension.
              </p>
            </div>
          )}

          <button
            onClick={disconnect}
            className="w-full py-2 px-4 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}