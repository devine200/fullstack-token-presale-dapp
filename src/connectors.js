import { InjectedConnector } from "@web3-react/injected-connector";

export const supportedChainIds = [42161, 421611, 1337]
export const metaMask = new InjectedConnector({
    supportedChainIds: supportedChainIds
});
