import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { DAppProvider, Mainnet } from '@usedapp/core'
import { getDefaultProvider } from 'ethers';

const config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {     
    [Mainnet.chainId]: getDefaultProvider('mainnet'),
    // [Mainnet.chainId]: 'https://mainnet.infura.io/v3/62687d1a985d4508b2b7a24827551934',
  },
}

ReactDOM.render(
  <DAppProvider config={config}>
    <App />
  </DAppProvider>,
  document.getElementById('root')
);
