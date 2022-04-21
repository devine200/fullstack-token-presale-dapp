pragma solidity 0.8.13;

import "./IERC20.sol";
import "./SafeMath.sol";
import "./MerkleProof.sol";

contract GlitchDaoPresale {
  using SafeMath for uint256;

  // The token being sold
  address public token;
  address public nativeToken;
  uint public startTime;
  uint256 public lockupPeriod;
  uint256 public whitelistPeriod;
  uint256 public publicSalePeriod;
  bytes32 public merkleRoot = 0x17f5b200ca60f3f7f02d59f8f94bde468d2093a8c9aad13f30be83f39f4398d1;

  // Address where funds are collected
  address public owner;

  // Amount of wei raised
  // uint256 public weiRaised;

  mapping(address=>uint256) public presalePosition;

  event TokenPurchase(
    address indexed purchaser,
    uint256 value,
    uint256 amount
  );

  constructor(address _token, address _nativeToken) public {
    require(msg.sender != address(0));
    require(_token != address(0));
    owner = msg.sender;
    token = _token;
    nativeToken = _nativeToken;
    startTime = 1650322800;
    lockupPeriod = 86400;
    whitelistPeriod = 60*60*2;
    publicSalePeriod = 60*30;
    // lockupPeriod = 86400;
    // whitelistPeriod = 60*60*2;
    // publicSalePeriod = 60*30;
  }

  function buyTokens(uint256 weiAmount, bytes32[] memory _merkleProof) public payable {
    require(block.timestamp >= startTime, "presale has not begone");
    require(IERC20(token).balanceOf(msg.sender) >= weiAmount, "Insufficient fund required to buy tokens");
    require(block.timestamp < startTime + whitelistPeriod + publicSalePeriod, "Presale is over");

    if(block.timestamp > startTime && block.timestamp < startTime+whitelistPeriod){
    require(weiAmount <= 3000 ether && presalePosition[msg.sender] + weiAmount <= 3000 ether, "Presale amount per account is exceeded");
      bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
      require(
          MerkleProof.verify(_merkleProof, merkleRoot, leaf),
          "user not whitelisted"
      );
      // calculate token amount to be created
      uint256 tokens = weiAmount.mul(2);
      IERC20(token).transferFrom(msg.sender, address(this), weiAmount);

      // update state
      presalePosition[msg.sender] += tokens.mul(10**12);

    }else{
      uint256 tokens = weiAmount.mul(10).div(8);
      IERC20(token).transferFrom(msg.sender, address(this), weiAmount);
      // update state
      presalePosition[msg.sender] += tokens.mul(10**12);
      emit TokenPurchase(
        msg.sender,
        weiAmount,
        tokens
      );
    }
  }

  function claim() external {
    require(block.timestamp > startTime + lockupPeriod, "tokens cannot be claimed yet");
    require(presalePosition[msg.sender] > 0, "User has no token to claim");
    IERC20(nativeToken).transfer(msg.sender, presalePosition[msg.sender]);
  }

  modifier OnlyOwner {
    require(msg.sender == owner);
    _;
  }

  function forwardFunds(uint256 amount) public OnlyOwner {
    require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient funds available in contract");
    IERC20(token).transfer(owner, amount);
  }

  function forwardNativeFunds(uint256 amount) public OnlyOwner {
    require(IERC20(nativeToken).balanceOf(address(this)) >= amount, "Insufficient funds available in contract");
    IERC20(nativeToken).transfer(owner, amount);
  }
}