const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Glitch", function () {
  let glitch, token, nativeToken, owner, benefactor, ownerAddress, benefactorAddress;

  beforeEach(async function (){
    const Glitch = await ethers.getContractFactory("GlitchDaoPresale");
    const Token = await ethers.getContractFactory("ERC20");
    const NativeToken = await ethers.getContractFactory("ERC20");
    token = await Token.deploy("T", "T", ethers.BigNumber.from("6"));
    nativeToken = await NativeToken.deploy("T1", "T1", ethers.BigNumber.from("18"));
    glitch = await Glitch.deploy(token.address, nativeToken.address);
    const [_owner, _benefactor, _] = await ethers.getSigners();
    // const accounts = await ethers.getSigners();
    owner = _owner;
    benefactor = _benefactor
    ownerAddress = await owner.getAddress();
    benefactorAddress = await benefactor.getAddress();
    // console.log(await accounts.map(await (async (account)=>{
    //   const address = await account.getAddress()
    //   return address
    // })));
  })
   
  it("Should buy token and claim token", async function () {
    await token.mintTo(ownerAddress, ethers.BigNumber.from("50000000"));
    await nativeToken.mintTo(glitch.address, ethers.utils.parseEther("5000000"));

    const ownerBalance = await token.balanceOf(ownerAddress);
    expect(ownerBalance).to.equal(ethers.BigNumber.from("50000000"));
    
    // console.log({ownerBalance, glitchNativeTokenBalance: await nativeToken.balanceOf(glitch.address)})
    // console.log(ethers.utils.formatEther(ownerBalance))
    // console.log("token decimal: ", await nativeToken.decimals())
    
    
    const glitchBalance = await token.balanceOf(glitch.address);
    await token.approve(glitch.address, ethers.BigNumber.from("50000000"));
    await glitch.buyTokens(ethers.BigNumber.from("50000000"));
    const glitchNewBalance = await token.balanceOf(glitch.address);

    expect(glitchBalance).to.not.equal(glitchNewBalance);

    // console.log(glitchNewBalance)
    await expect(glitch.claim()).to.not.be.revertedWith("tokens cannot be claimed yet");
    expect(await nativeToken.balanceOf(ownerAddress)).to.not.equal(ethers.utils.parseEther("100"))
    await glitch.forwardFunds(ethers.BigNumber.from(""+50*10**6));
    expect(await token.balanceOf(glitch.address)).to.equal(ethers.utils.parseEther("0"));

    const ownerNativeBalance = await nativeToken.balanceOf(ownerAddress);
    await glitch.forwardNativeFunds(ethers.utils.parseEther("1000"));
    expect(await nativeToken.balanceOf(ownerAddress)).to.be.equal(ownerNativeBalance.add(ethers.utils.parseEther("1000")));
    
    await expect(glitch.connect(benefactor).forwardNativeFunds(ethers.utils.parseEther("1000"))).to.be.reverted;
  });

  it("testing whitelist presale implemantion", async function (){
    await token.mintTo(benefactorAddress, ethers.BigNumber.from(""*100*10**6));
    await nativeToken.mintTo(glitch.address, ethers.utils.parseEther("5000000"));

    await token.connect(benefactor).approve(glitch.address, ethers.BigNumber.from(""*100*10**6));
    await expect(glitch.connect(benefactor).buyTokens(ethers.utils.parseEther("100"))).to.not.be.revertedWith("user not whitelisted");
    // await glitch.connect(benefactor).claim();
    await expect(glitch.connect(benefactor).claim()).to.be.reverted;
  })
});
