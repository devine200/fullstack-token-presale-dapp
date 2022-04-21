import { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';

import { metaMask, supportedChainIds } from '../connectors';


export function useInactiveListener(suppress = false) {
    const { active, error, activate, disconnect } = useWeb3React();
  
    useEffect(() => {
      const { ethereum } = window;
      if (ethereum && ethereum.on && !active && !error && !suppress) {
        const handleChainChanged = (chainId) => {
          console.log('chainChanged', chainId);
          if(supportedChainIds.includes(chainId)){
            activate(metaMask);
          }else{
            window.location.reload();
          }
        };
  
        const handleAccountsChanged = (accounts) => {
          console.log('accountsChanged', accounts);
          if (accounts.length > 0) {
            activate(metaMask);
          }
        };
  
        const handleNetworkChanged = (networkId) => {
          console.log('networkChanged', networkId);
          activate(metaMask);
        };
  
        ethereum.on('chainChanged', handleChainChanged);
        ethereum.on('accountsChanged', handleAccountsChanged);
        ethereum.on('networkChanged', handleNetworkChanged);
  
        return () => {
          if (ethereum.removeListener) {
            ethereum.removeListener('chainChanged', handleChainChanged);
            ethereum.removeListener('accountsChanged', handleAccountsChanged);
            ethereum.removeListener('networkChanged', handleNetworkChanged);
          }
        };
      }
  
      return () => {};
    }, [active, error, suppress, activate]);
  }
  