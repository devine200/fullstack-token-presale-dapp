import "./App.css";
import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { metaMask, supportedChainIds } from "./connectors";
import { ethers } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
import CountdownTimer from "react-component-countdown-timer";
import { useEthers } from "@usedapp/core";

import logo from "./img/logo.jpg";
import walletIcon from "./img/wallet-icon.png";
import { useInactiveListener } from "./hooks/connect";
import glitchDaoAbi from "./artembleAbi.json";
import ERC20Abi from "./ERC20.json";

function App() {
  const glitchDaoAddress = "0x1a5a0BD50583729EFd21fAd4B6e7D5107bE48d36";
  const [canMint, setCanMint] = useState(false);
  const [inWhitelistPeriod, setInWhitelistPeriod] = useState(false);
  const [amount, setAmount] = useState(0);
  const counterStartTime = 1650322800;
  const counterWhitelistPeriod = 60 * 60 * 2;
  const counterPublicSalePeriod = 60 * 30;
  const counterCurrentTime = new Date().getTime() / 1000;
  const currentCount =
    counterStartTime + counterWhitelistPeriod - counterCurrentTime;
  const { activateBrowserWallet, active, account } = useEthers();
  useInactiveListener();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    if (active) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const glitchContract = new ethers.Contract(
        glitchDaoAddress,
        glitchDaoAbi,
        signer
      );

      const startTime = await glitchContract.startTime();
      const whitelistPeriod = await glitchContract.whitelistPeriod();
      const currentTime = new Date().getTime() / 1000;

      if (currentTime >= startTime) {
        setCanMint(true);
        if (currentTime < startTime.toNumber() + whitelistPeriod.toNumber()) {
          setInWhitelistPeriod(true);
        }
      }
    }

    console.log({active});
  }, [active]);

  const handleMint = async (e) => {
    if (active) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const USDC = new ethers.Contract(
        "0x7Ae630216c3F73bDec79131F2Be9d8032b874Ec8",
        ERC20Abi,
        signer
      );

      const glitchContract = new ethers.Contract(
        glitchDaoAddress,
        glitchDaoAbi,
        signer
      );

      try {
        if (amount > 0) {
          const [wholeNumber, decimal] = stripAmount(amount);
          console.log(wholeNumber * 10 ** (6 - decimal));
          await USDC.approve(
            glitchDaoAddress,
            BigNumber.from("" + wholeNumber * 10 ** (6 - decimal))
          );
          await glitchContract.buyTokens(
            BigNumber.from("" + wholeNumber * 10 ** (6 - decimal)),
            [
              "0x5c80e82c0bed009663b6dc8d17b7dcabe075510f9ffaf014ce6a093d12a347e5",
              "0x83ddce7a8d8344327029ae74f9f0fb9658d1e764c80886e03ff1f55d3a6fd594",
            ],
            { gasLimit: 50000000 }
          );
          alert("Presale Position Created Successfully To Be Claimed In 24hrs");
          setAmount(0);
        }
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const stripAmount = (val) => {
    const valString = val.toString();
    const valParts = valString.split(".");
    const decimals = valParts[1] ? valParts[1].length : 0;
    return [
      parseInt(valString.split().splice(valString.indexOf("."), 1).join("")),
      decimals,
    ];
  };

  const handleConnectWallet = async (e) => {
    e.preventDefault();

    const currentChainId = parseInt(window.ethereum.chainId, 16);

    if (window.ethereum && !supportedChainIds.includes(currentChainId)) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xA4B1",
              chainName: "Arbitrum One",
              rpcUrls: ["https://arb1.arbitrum.io/rpc"],
              blockExplorerUrls: ["https://arbiscan.io"],
              nativeCurrency: {
                symbol: "AETH",
                decimals: 18,
              },
            },
          ],
        });
      } catch (addError) {
        alert(addError.message);
      }
    }
    activateBrowserWallet();
    // activate(metaMask, (e) => {
    //   if (e.toString().toLowerCase().includes("no ethereum")) {
    //     alert("In order to make use of this website you need metamask");
    //   } else if (e.toString().toLowerCase().includes("already pending")) {
    //     alert(
    //       "Connection request already pending, check metamask plugin for approval request"
    //     );
    //   }
    // });
  };

  const shortenAccount = (userAccount) => {
    return `${userAccount.substring(0, 6)}...${userAccount.substring(
      userAccount.length - 4,
      userAccount.length
    )}`;
  };

  return (
    <div className="App">
      <div className="container">
        <header>
          <img src={logo} alt="artemble-logo" className="logo" />
          {/* <a
            href="#"
            className="btn icon-btn colored-btn"
            onClick={!active ? handleConnectWallet : () => {}}
          >
            <img src={walletIcon} alt="wallet-icon" />
            {!active ? (
              <span>Connect Wallet</span>
            ) : (
              <span>{shortenAccount(account)}</span>
            )}
          </a> */}
        </header>
        <main>
          <div className="main-screen-left">
            <h2>
              WELCOME TO GLITCH DAO <br />
              THE FIRST ICHI FORK ON ARBITRUM
              <br />
              WITH ADDED FUNCTIONALITIES
            </h2>
            <p>
              Crypto naive projects solving the problem of stable coins for
              crypto projects. We deployed a Decentralized Monetary Authority
              (DMA), a DAO customized to give any community a branded dollar
              worth 1 USD. The Branded Dollar that is created in the process is
              minted with a community's scarce crypto asset and is capital
              efficient.
            </p>
            <div className="btn-holder">
              <a
                href="https://docs.glitchdao.finance"
                className="btn bordered-btn"
              >
                LEARN MORE
              </a>
            </div>
          </div>
          <div className="main-screen-right">
            <img src={logo} alt="-logo" className="logo side-logo" />
            <h2>Join Our Pre-sale</h2>
            <div className="mint-input">
              <label htmlFor="#amount">USDC</label>
              <input
                type="number"
                placeholder="0.0"
                id="amount"
                defaultValue={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
              />
            </div>
            {active ? <button onClick={handleMint}>Buy Now</button> : <></>}
          </div>
        </main>
        {counterCurrentTime > counterStartTime &&
        counterCurrentTime < counterStartTime + counterWhitelistPeriod ? (
          <footer>
            <span className="mint-countdown-text">
              Whitelist Presale Timer:
            </span>
            <CountdownTimer
              count={currentCount}
              noPoints={true}
              showTitle={true}
              border={true}
              responsive={true}
            />
          </footer>
        ) : counterCurrentTime > counterStartTime + counterWhitelistPeriod &&
          counterCurrentTime <
            counterStartTime +
              counterWhitelistPeriod +
              counterPublicSalePeriod ? (
          <footer>
            <span className="mint-countdown-text">Public Presale Timer:</span>
            <CountdownTimer
              count={currentCount}
              noPoints={true}
              showTitle={true}
              border={true}
              responsive={true}
            />
          </footer>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default App;
