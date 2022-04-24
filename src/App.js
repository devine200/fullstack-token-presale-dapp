import "./App.css";
import { useEffect, useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import CountdownTimer from "react-component-countdown-timer";
import {
  useEthers,
  useContractFunction,
} from "@usedapp/core";

import logo from "./img/logo.jpg";
import walletIcon from "./img/wallet-icon.png";
import Config from "./config.json";

function App() {
  const {currentState, presaleAbi, ERC20Abi, supportedChainIds} = Config;

  const [amount, setAmount] = useState(0);
  const [isFirst, setIsFirst] = useState(true);
  const [canBuy, setCanBuy] = useState(false);
  const counterStartTime = (new Date()).getTime()/1000;
  const counterWhitelistPeriod = 60 * 60 * 2;
  const counterPublicSalePeriod = 60 * 30;
  const counterCurrentTime = new Date().getTime() / 1000;
  const currentCount =
    counterStartTime + counterWhitelistPeriod - counterCurrentTime;
  const { activateBrowserWallet, active, account, chainId, deactivate } =
    useEthers();
  // console.log({ active, account: !account });
  const presaleContract = new Contract(Config[currentState].presaleContractAddress, presaleAbi);
  const USDC = new Contract(Config[currentState].USDCAddress, ERC20Abi);

  const { state: presaleContractState, send: presaleContractCall } =
    useContractFunction(presaleContract, "buyTokens", {
      transactionName: "Unwrap",
    });
  
  const { state: USDCContractState, send: USDCContractCall } =
    useContractFunction(USDC, "approve", {
      transactionName: "Unwrap",
    });

  useEffect(() => {
    if (presaleContractState.errorMessage) {
      alert(presaleContractState.errorMessage);
    }

    if (USDCContractState.errorMessage) {
      alert(USDCContractState.errorMessage);
    }

    if(USDCContractState.status.toLowerCase() === "success"){
      buyTokens();
    }

    // console.log({ presaleContractState });
    // eslint-disable-next-line default-case
    switch (presaleContractState.status) {
      case "Exception":
        console.log(presaleContractState.errorMessage);
        break;

      case "Fail":
        console.log(presaleContractState.errorMessage);
        break;

      case "Success":
        alert("Presale Position Created Successfully To Be Claimed In 24hrs");
        window.location.reload();
        break;
    }
  }, [presaleContractState, USDCContractState]);

  useEffect(() => {
    if (!supportedChainIds.includes(chainId) && !isFirst) {
      deactivate();
      alert("You have connected to an unsupported chain");
    }
    setIsFirst(false);
  }, [chainId]);

  const handleMint = async (e) => {
    if (active && account) {
      try {
        if (amount > 0) {
          const [wholeNumber, decimal] = stripAmount(amount);
          // eslint-disable-next-line react-hooks/rules-of-hooks
          USDCContractCall(
            Config[currentState].presaleContractAddress,
            BigNumber.from("" + wholeNumber * 10 ** (6 - decimal))
          );

          setCanBuy(true);
        }
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const buyTokens = () => {
    if(!canBuy) return
    const [wholeNumber, decimal] = stripAmount(amount);
    presaleContractCall(BigNumber.from("" + wholeNumber * 10 ** (6 - decimal)));
    setCanBuy(false);
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

    if (window.ethereum && !supportedChainIds.includes(chainId)) {
      try {
        window.ethereum
          .request({
            method: "wallet_addEthereumChain",
            params: Config[currentState].networkParams
          })
          .then(() => {
            setIsFirst(true);
            activateBrowserWallet();
          });
      } catch (addError) {
        alert(addError.message);
      }
    } else {
      activateBrowserWallet();
    }
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
          <a
            href="#"
            className="btn icon-btn colored-btn"
            onClick={!active || !account ? handleConnectWallet : () => {}}
          >
            <img src={walletIcon} alt="wallet-icon" />
            {!active || !account ? (
              <span onClick={handleConnectWallet}>Connect Wallet</span>
            ) : (
              // <span>{account}</span>
              <span>{shortenAccount(account)}</span>
            )}{" "}
            {/**/}
          </a>
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
                href={Config[currentState].docsLink}
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
