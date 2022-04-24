pragma solidity 0.8.13;

import "./IERC20.sol";
import "./SafeMath.sol";

contract Presale {
  using SafeMath for uint256;

  // The token being sold
  address public token;
  address public nativeToken;
  uint public startTime;
  uint256 public lockupPeriod;
  bool private paused;

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
    startTime = 1650747600;
    lockupPeriod = 86400;
    paused = false;
  }

  function buyTokens(uint256 weiAmount) public payable {
    require(!paused, "The Presale Is Over");
    require(block.timestamp >= startTime, "presale has not begone");
    require(IERC20(token).balanceOf(msg.sender) >= weiAmount, "Insufficient fund required to buy tokens");

    // calculate token amount to be created
    uint256 tokens = weiAmount.mul(2);
    IERC20(token).transferFrom(msg.sender, address(this), weiAmount);

    // update state
    presalePosition[msg.sender] += tokens.mul(10**12);

    emit TokenPurchase(
      msg.sender,
      weiAmount,
      tokens
    );
    
  }

  function claim() external {
    require(block.timestamp > startTime + lockupPeriod, "tokens cannot be claimed yet");
    require(presalePosition[msg.sender] > 0, "User has no token to claim");
    IERC20(nativeToken).transfer(msg.sender, presalePosition[msg.sender]);
    presalePosition[msg.sender] = 0;
  }

  modifier OnlyOwner {
    require(msg.sender == owner, "This method is only accessible by the owner");
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

  function setPaused(bool _paused) external OnlyOwner {
    paused = _paused;
  }
}