import { InjectedConnector } from "@web3-react/injected-connector";

export const supportedChainIds = [1, 4, 421611, 1088]
export const metaMask = new InjectedConnector({
    supportedChainIds: supportedChainIds
});
