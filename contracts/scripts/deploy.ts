import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // ── Deploy Mock ERC-20 (testnet only) ──
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockToken = await MockERC20.deploy();
  await mockToken.waitForDeployment();
  const tokenAddress = await mockToken.getAddress();
  console.log("MockERC20 deployed to:", tokenAddress);

  // ── Deploy WhitePanther NFT ──
  const mintPrice = ethers.parseUnits("100", 18); // 100 tokens per NFT
  const WhitePanther = await ethers.getContractFactory("WhitePanther");
  const nft = await WhitePanther.deploy(
    tokenAddress,
    mintPrice,
    deployer.address,
  );
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("WhitePanther NFT deployed to:", nftAddress);

  console.log("\n══════════════════════════════════════");
  console.log("  Deployment Summary");
  console.log("══════════════════════════════════════");
  console.log(`  Payment Token : ${tokenAddress}`);
  console.log(`  NFT Contract  : ${nftAddress}`);
  console.log(`  Mint Price    : 100 MOCK tokens`);
  console.log(`  Max Supply    : 10,000 NFTs`);
  console.log("══════════════════════════════════════\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
