import { UPProvider } from '@lukso/up-provider';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

// UP Provider instance
let upProvider: UPProvider | null = null;

// Initialize UP Provider
export function initUPProvider(): UPProvider {
  if (typeof window === 'undefined') {
    throw new Error('UP Provider can only be initialized in browser');
  }
  
  if (!upProvider) {
    upProvider = new UPProvider();
  }
  
  return upProvider;
}

// Get UP Provider (create if not exists)
export function getUPProvider(): UPProvider | null {
  if (typeof window === 'undefined') return null;
  
  if (!upProvider) {
    try {
      upProvider = new UPProvider();
    } catch (error) {
      console.error('Failed to initialize UP Provider:', error);
      return null;
    }
  }
  
  return upProvider;
}

// Get ethers BrowserProvider from UP Provider
export async function getBrowserProvider(): Promise<BrowserProvider | null> {
  const provider = getUPProvider();
  if (!provider) return null;
  
  try {
    // UP Provider acts as an EIP-1193 provider
    return new BrowserProvider(provider as any);
  } catch (error) {
    console.error('Failed to create BrowserProvider:', error);
    return null;
  }
}

// Get signer from provider
export async function getSigner(): Promise<JsonRpcSigner | null> {
  const provider = await getBrowserProvider();
  if (!provider) return null;
  
  try {
    return await provider.getSigner();
  } catch (error) {
    console.error('Failed to get signer:', error);
    return null;
  }
}

// Get connected accounts
export async function getAccounts(): Promise<string[]> {
  const provider = getUPProvider();
  if (!provider) return [];
  
  try {
    return await provider.request({ method: 'eth_accounts' }) as string[];
  } catch (error) {
    console.error('Failed to get accounts:', error);
    return [];
  }
}

// Request accounts (connect)
export async function requestAccounts(): Promise<string[]> {
  const provider = getUPProvider();
  if (!provider) return [];
  
  try {
    return await provider.request({ method: 'eth_requestAccounts' }) as string[];
  } catch (error) {
    console.error('Failed to request accounts:', error);
    return [];
  }
}

// Get chain ID
export async function getChainId(): Promise<number | null> {
  const provider = getUPProvider();
  if (!provider) return null;
  
  try {
    const chainId = await provider.request({ method: 'eth_chainId' }) as string;
    return parseInt(chainId, 16);
  } catch (error) {
    console.error('Failed to get chain ID:', error);
    return null;
  }
}

// Listen for account changes
export function onAccountsChanged(callback: (accounts: string[]) => void): void {
  const provider = getUPProvider();
  if (!provider) return;
  
  provider.on('accountsChanged', callback);
}

// Listen for chain changes
export function onChainChanged(callback: (chainId: string) => void): void {
  const provider = getUPProvider();
  if (!provider) return;
  
  provider.on('chainChanged', callback);
}

// Remove listeners
export function removeListeners(): void {
  const provider = getUPProvider();
  if (!provider) return;
  
  provider.removeAllListeners();
}