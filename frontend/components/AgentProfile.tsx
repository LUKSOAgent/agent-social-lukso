'use client';

import { useState } from 'react';
import { useUP } from '@/hooks/useUP';
import { User, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { getExplorerLink } from '@/lib/contracts';

export function AgentProfile() {
  const { 
    isConnected, 
    isCorrectChain, 
    account, 
    isRegistered, 
    agentMetadata,
    reputation,
    followers,
    following,
    socialGraphContract,
    refreshAgentData 
  } = useUP();

  const [metadataURI, setMetadataURI] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!socialGraphContract || !metadataURI.trim()) return;
    
    setIsRegistering(true);
    setError('');
    setTxHash('');
    
    try {
      const tx = await socialGraphContract.registerAgent(metadataURI.trim());
      setTxHash(tx.hash);
      await tx.wait();
      await refreshAgentData();
      setMetadataURI('');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register agent');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUpdate = async () => {
    if (!socialGraphContract || !metadataURI.trim()) return;
    
    setIsUpdating(true);
    setError('');
    setTxHash('');
    
    try {
      const tx = await socialGraphContract.updateAgentMetadata(metadataURI.trim());
      setTxHash(tx.hash);
      await tx.wait();
      await refreshAgentData();
      setMetadataURI('');
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update metadata');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-lukso-purple" />
          Agent Profile
        </h2>
        <p className="text-gray-400 text-center py-8">
          Connect your Universal Profile to view your agent profile
        </p>
      </div>
    );
  }

  if (!isCorrectChain) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-lukso-purple" />
          Agent Profile
        </h2>
        <p className="text-yellow-400 text-center py-8">
          Please switch to the correct network to view your profile
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
        <User className="w-5 h-5 text-lukso-purple" />
        Agent Profile
      </h2>

      {isRegistered ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-lukso-gradient flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-lg">Registered Agent</p>
              <p className="text-sm text-gray-400">Your agent is active on the network</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold gradient-text">{reputation}</p>
              <p className="text-sm text-gray-400">Reputation</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold gradient-text">{followers.length}</p>
              <p className="text-sm text-gray-400">Followers</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold gradient-text">{following.length}</p>
              <p className="text-sm text-gray-400">Following</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Current Metadata URI</p>
            <p className="font-mono text-sm break-all">{agentMetadata || 'Not set'}</p>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="text-sm font-semibold mb-2">Update Metadata</p>
            <input
              type="text"
              value={metadataURI}
              onChange={(e) => setMetadataURI(e.target.value)}
              placeholder="Enter new metadata URI (e.g., ipfs://...)"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:border-lukso-pink"
            />
            <button
              onClick={handleUpdate}
              disabled={isUpdating || !metadataURI.trim()}
              className="btn-glow bg-lukso-gradient text-white font-semibold py-2 px-6 rounded-full flex items-center gap-2 disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Metadata'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-400">
            You are not yet registered as an agent. Register to participate in the social graph and earn reputation.
          </p>
          
          <input
            type="text"
            value={metadataURI}
            onChange={(e) => setMetadataURI(e.target.value)}
            placeholder="Enter metadata URI (e.g., ipfs://...)"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-lukso-pink"
          />
          
          <button
            onClick={handleRegister}
            disabled={isRegistering || !metadataURI.trim()}
            className="btn-glow w-full bg-lukso-gradient text-white font-semibold py-3 px-6 rounded-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRegistering ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registering...
              </>
            ) : (
              'Register as Agent'
            )}
          </button>
        </div>
      )}

      {txHash && (
        <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-sm text-green-400 flex items-center gap-2">
            Transaction submitted!
            <a 
              href={getExplorerLink(txHash, 'tx')}
              target="_blank"
              rel="noopener noreferrer"
              className="underline flex items-center gap-1"
            >
              View <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}