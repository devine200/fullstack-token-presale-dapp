// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const {ethers} = hre;

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Presale = await ethers.getContractFactory("Presale");
  // const Token = await ethers.getContractFactory("ERC20");
  const NativeToken = await ethers.getContractFactory("ERC20");

  // const token = await Token.deploy("T", "T", ethers.BigNumber.from("6"));
  const nativeToken = await NativeToken.deploy("GLITCH", "GLT", ethers.BigNumber.from("18"));
  const USDCAddress = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
  const presale = await Presale.deploy(USDCAddress, nativeToken.address);
  
  // await token.mintTo("0x82E65ADD41CF5df9Be92B2894E0A74D652e7dFb6", ethers.utils.parseEther("1"));
  await nativeToken.mintTo(presale.address, ethers.utils.parseEther("5000000"));

  // console.log("Token deployed to:", token.address);
  console.log("NativeToken deployed to:", nativeToken.address);
  console.log("Presale deployed to:", presale.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
