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
    const [_owner, _benefactor, _] = await ethers.getSigners()
    owner = _owner;
    benefactor = _benefactor
    ownerAddress = await owner.getAddress();
    benefactorAddress = await benefactor.getAddress();
  })
   
  it("Should buy token and claim token", async function () {
    await token.mintTo(ownerAddress, ethers.BigNumber.from(""*100*10**6));
    await nativeToken.mintTo(glitch.address, ethers.utils.parseEther("5000000"));

    const ownerBalance = await token.balanceOf(ownerAddress);
    expect(ownerBalance).to.equal(ethers.utils.parseEther("100"));
    
    console.log(ethers.utils.formatEther(ownerBalance))
    console.log("token decimal: ", await nativeToken.decimals())
    
    
    const glitchBalance = await token.balanceOf(glitch.address);
    await token.approve(glitch.address, ethers.BigNumber.from(""*50*10**6));
    await glitch.connect(owner).buyTokens(ethers.BigNumber.from(""*50*10**6), [
      '0x5c80e82c0bed009663b6dc8d17b7dcabe075510f9ffaf014ce6a093d12a347e5',
      '0x83ddce7a8d8344327029ae74f9f0fb9658d1e764c80886e03ff1f55d3a6fd594'
    ]);
    const glitchNewBalance = await token.balanceOf(glitch.address);

    // expect(glitchBalance).to.not.equal(glitchNewBalance);

    console.log(glitchNewBalance)
    setTimeout(async()=>{
      await expect(glitch.connect(owner).claim()).to.be.revertedWith("tokens cannot be claimed yet");
      // expect(await nativeToken.balanceOf(ownerAddress)).to.not.equal(ethers.utils.parseEther("100"))
      await glitch.forwardFunds(ethers.BigNumber.from(""+100*10**6));
      // expect(await token.balanceOf(ownerAddress)).to.equal(glitchNewBalance);
    }, 2000);

  });

  it("testing whitelist presale implemantion", async function (){
    await token.mintTo(benefactorAddress, ethers.BigNumber.from(""*100*10**6));
    await nativeToken.mintTo(glitch.address, ethers.utils.parseEther("5000000"));

    await token.connect(benefactor).approve(glitch.address, ethers.BigNumber.from(""*100*10**6));
    await expect(glitch.connect(benefactor).buyTokens(ethers.utils.parseEther("100"), [
      '0x5c80e82c0bed009663b6dc8d17b7dcabe075510f9ffaf014ce6a093d12a347e5',
      '0x83ddce7a8d8344327029ae74f9f0fb9658d1e764c80886e03ff1f55d3a6fd594'
    ])).to.not.be.revertedWith("user not whitelisted");
    // await glitch.connect(benefactor).claim();
    setTimeout(async ()=>{
      await expect(glitch.connect(benefactor).claim()).to.not.be.reverted;
    }, 2000)
  })
});
