import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const MOCK_TOKEN = "0x298D88D65B825D01f6A6Ca079de8cc21FbE74928";
  const NFT_CONTRACT = "0x206F431abCEdd9E5022E55BE834CAE9a31d95cC6";

  console.log("Using deployer:", deployer.address);

  // Connect to MockERC20
  const mockToken = await ethers.getContractAt("MockERC20", MOCK_TOKEN);

  // Check current balance
  const currentBalance = await mockToken.balanceOf(deployer.address);
  console.log("Current MOCK balance:", ethers.formatUnits(currentBalance, 18));

  // Mint 10,000 MOCK tokens
  const mintAmount = ethers.parseUnits("10000", 18);
  const tx1 = await mockToken.mint(deployer.address, mintAmount);
  await tx1.wait();
  console.log("✓ Minted 10,000 MOCK tokens");

  // Approve NFT contract to spend MOCK tokens
  const tx2 = await mockToken.approve(NFT_CONTRACT, ethers.MaxUint256);
  await tx2.wait();
  console.log("✓ Approved NFT contract to spend MOCK tokens");

  // Verify
  const newBalance = await mockToken.balanceOf(deployer.address);
  const allowance = await mockToken.allowance(deployer.address, NFT_CONTRACT);
  console.log("New MOCK balance:", ethers.formatUnits(newBalance, 18));
  console.log("Allowance for NFT:", ethers.formatUnits(allowance, 18));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
