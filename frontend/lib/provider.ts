// Provider for Universal Profile connection
// Uses standard EIP-1193 provider pattern

import { BrowserProvider, JsonRpcSigner, Eip1193Provider } from 'ethers';

// Extend Window interface for Lukso provider
declare global {
  interface Window {
    lukso?: Eip1193Provider;
    ethereum?: Eip1193Provider;
  }
}

// Get the provider from window (Lukso or standard ethereum)
export function getEip1193Provider(): Eip1193Provider | null {
  if (typeof window === 'undefined') return null;
  
  // Try Lukso provider first, then fallback to ethereum
  return window.lukso || window.ethereum || null;
}

// Get ethers BrowserProvider
export async function getBrowserProvider(): Promise<BrowserProvider | null> {
  const eip1193Provider = getEip1193Provider();
  if (!eip1193Provider) return null;
  
  try {
    return new BrowserProvider(eip1193Provider);
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
  const provider = getEip1193Provider();
  if (!provider) return [];
  
  try {
    const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
    return accounts;
  } catch (error) {
    console.error('Failed to get accounts:', error);
    return [];
  }
}

// Request accounts (connect)
export async function requestAccounts(): Promise<string[]> {
  const provider = getEip1193Provider();
  if (!provider) return [];
  
  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
    return accounts;
  } catch (error) {
    console.error('Failed to request accounts:', error);
    return [];
  }
}

// Get chain ID
export async function getChainId(): Promise<number | null> {
  const provider = getEip1193Provider();
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
  const provider = getEip1193Provider();
  if (!provider) return;
  
  // @ts-ignore - EIP-1193 event listeners
  provider.on('accountsChanged', callback);
}

// Listen for chain changes
export function onChainChanged(callback: (chainId: string) => void): void {
  const provider = getEip1193Provider();
  if (!provider) return;
  
  // @ts-ignore - EIP-1193 event listeners
  provider.on('chainChanged', callback);
}

// Remove listeners
export function removeListeners(): void {
  const provider = getEip1193Provider();
  if (!provider) return;
  
  // @ts-ignore - EIP-1193 event listeners
  provider.removeAllListeners?.();
}
