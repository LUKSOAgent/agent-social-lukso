'use client';

import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner, Contract } from 'ethers';
import {
  getUPProvider,
  getBrowserProvider,
  getSigner,
  getAccounts,
  requestAccounts,
  getChainId,
  onAccountsChanged,
  onChainChanged,
} from '@/lib/provider';
import {
  CONTRACTS,
  AGENT_REPUTATION_TOKEN_ABI,
  AGENT_SOCIAL_GRAPH_ABI,
  LUKSO_TESTNET,
} from '@/lib/contracts';

interface UPContext {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  chainId: number | null;
  isCorrectChain: boolean;
  
  // Providers
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  
  // Contracts
  reputationContract: Contract | null;
  socialGraphContract: Contract | null;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Agent state
  isRegistered: boolean;
  agentMetadata: string;
  reputation: string;
  followers: string[];
  following: string[];
  
  // Refresh data
  refreshAgentData: () => Promise<void>;
}

export function useUP(): UPContext {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  
  // Providers
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  
  // Contracts
  const [reputationContract, setReputationContract] = useState<Contract | null>(null);
  const [socialGraphContract, setSocialGraphContract] = useState<Contract | null>(null);
  
  // Agent state
  const [isRegistered, setIsRegistered] = useState(false);
  const [agentMetadata, setAgentMetadata] = useState('');
  const [reputation, setReputation] = useState('0');
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  const isCorrectChain = chainId === LUKSO_TESTNET.chainId;

  // Initialize provider on mount
  useEffect(() => {
    const init = async () => {
      const browserProvider = await getBrowserProvider();
      if (browserProvider) {
        setProvider(browserProvider);
      }
      
      // Check if already connected
      const accounts = await getAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        const currentChainId = await getChainId();
        setChainId(currentChainId);
        
        const currentSigner = await getSigner();
        setSigner(currentSigner);
      }
    };
    
    init();
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // Disconnected
        setAccount(null);
        setIsConnected(false);
        setSigner(null);
      } else {
        setAccount(accounts[0]);
        setIsConnected(true);
        // Refresh signer
        getSigner().then(setSigner);
      }
    };
    
    const handleChainChanged = (newChainId: string) => {
      setChainId(parseInt(newChainId, 16));
      // Refresh provider and signer on chain change
      getBrowserProvider().then(setProvider);
      getSigner().then(setSigner);
    };
    
    onAccountsChanged(handleAccountsChanged);
    onChainChanged(handleChainChanged);
    
    return () => {
      const upProvider = getUPProvider();
      if (upProvider) {
        upProvider.removeAllListeners();
      }
    };
  }, []);

  // Initialize contracts when signer is available
  useEffect(() => {
    if (signer) {
      const repContract = new Contract(
        CONTRACTS.AGENT_REPUTATION_TOKEN,
        AGENT_REPUTATION_TOKEN_ABI,
        signer
      );
      setReputationContract(repContract);
      
      const socialContract = new Contract(
        CONTRACTS.AGENT_SOCIAL_GRAPH,
        AGENT_SOCIAL_GRAPH_ABI,
        signer
      );
      setSocialGraphContract(socialContract);
    } else {
      setReputationContract(null);
      setSocialGraphContract(null);
    }
  }, [signer]);

  // Fetch agent data
  const fetchAgentData = useCallback(async () => {
    if (!account || !socialGraphContract || !reputationContract || !isCorrectChain) return;
    
    try {
      // Check if registered
      const registered = await socialGraphContract.isRegistered(account);
      setIsRegistered(registered);
      
      if (registered) {
        // Get metadata
        const metadata = await socialGraphContract.getAgentMetadata(account);
        setAgentMetadata(metadata);
        
        // Get reputation
        const rep = await reputationContract.getReputation(account);
        setReputation(rep.toString());
        
        // Get followers
        const followerList = await socialGraphContract.getFollowers(account);
        setFollowers(followerList);
        
        // Get following
        const followingList = await socialGraphContract.getFollowing(account);
        setFollowing(followingList);
      }
    } catch (error) {
      console.error('Error fetching agent data:', error);
    }
  }, [account, socialGraphContract, reputationContract, isCorrectChain]);

  // Fetch data when connected
  useEffect(() => {
    if (isConnected && isCorrectChain) {
      fetchAgentData();
    }
  }, [isConnected, isCorrectChain, fetchAgentData]);

  // Connect function
  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const accounts = await requestAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        const currentChainId = await getChainId();
        setChainId(currentChainId);
        
        const browserProvider = await getBrowserProvider();
        setProvider(browserProvider);
        
        const currentSigner = await getSigner();
        setSigner(currentSigner);
      }
    } catch (error) {
      console.error('Error connecting:', error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect function
  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setSigner(null);
    setReputationContract(null);
    setSocialGraphContract(null);
    setIsRegistered(false);
    setAgentMetadata('');
    setReputation('0');
    setFollowers([]);
    setFollowing([]);
  }, []);

  return {
    isConnected,
    isConnecting,
    account,
    chainId,
    isCorrectChain,
    provider,
    signer,
    reputationContract,
    socialGraphContract,
    connect,
    disconnect,
    isRegistered,
    agentMetadata,
    reputation,
    followers,
    following,
    refreshAgentData: fetchAgentData,
  };
}