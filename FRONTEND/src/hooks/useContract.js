import { useCallback, useEffect, useState } from 'react';
import { BrowserProvider, getAddress } from 'ethers';

function getEthereum() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.ethereum ?? null;
}

export function useContract() {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const syncConnectedAccount = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      setAccount(null);
      return null;
    }

    const provider = new BrowserProvider(ethereum);
    const accounts = await provider.send('eth_accounts', []);
    const nextAccount = accounts[0] ? getAddress(accounts[0]) : null;
    setAccount(nextAccount);
    return nextAccount;
  }, []);

  const connect = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      const message = 'Wallet not detected';
      setError(message);
      return null;
    }

    setError(null);
    setIsConnecting(true);

    try {
      const provider = new BrowserProvider(ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const nextAccount = accounts[0] ? getAddress(accounts[0]) : null;

      if (!nextAccount) {
        throw new Error('Wallet not detected');
      }

      setAccount(nextAccount);
      return nextAccount;
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'code' in err && err.code === 4001
          ? 'Wallet connection rejected'
          : err instanceof Error
            ? err.message
            : 'Wallet connection failed';

      setError(message);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    void syncConnectedAccount();
  }, [syncConnectedAccount]);

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum?.on) {
      return undefined;
    }

    const handleAccountsChanged = (accounts) => {
      const nextAccount = accounts[0] ? getAddress(accounts[0]) : null;
      setAccount(nextAccount);
      setError(null);
    };

    const handleChainChanged = () => {
      void syncConnectedAccount();
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [syncConnectedAccount]);

  return {
    account,
    error,
    isConnecting,
    walletDetected: Boolean(getEthereum()),
    connect,
    clearError,
  };
}
