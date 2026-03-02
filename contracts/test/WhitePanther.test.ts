import { expect } from "chai";
import { ethers } from "hardhat";
import { WhitePanther, MockERC20 } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("WhitePanther NFT", function () {
  let nft: WhitePanther;
  let token: MockERC20;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const MINT_PRICE = ethers.parseUnits("100", 18); // 100 tokens
  const MAX_SUPPLY = 10_000n;
  const MAX_PER_TX = 10n;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy MockERC20
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    token = await MockERC20.deploy();

    // Deploy WhitePanther
    const WhitePanther = await ethers.getContractFactory("WhitePanther");
    nft = await WhitePanther.deploy(
      await token.getAddress(),
      MINT_PRICE,
      owner.address,
    );

    // Cấp tokens cho user1 và approve
    const mintAmount = ethers.parseUnits("10000", 18);
    await token.mint(user1.address, mintAmount);
    await token
      .connect(user1)
      .approve(await nft.getAddress(), ethers.MaxUint256);
  });

  // ═══════════════════════════════════════
  //  Deployment
  // ═══════════════════════════════════════

  describe("Deployment", function () {
    it("should set correct name and symbol", async function () {
      expect(await nft.name()).to.equal("White Panther");
      expect(await nft.symbol()).to.equal("WPNFT");
    });

    it("should set correct mint price", async function () {
      expect(await nft.mintPrice()).to.equal(MINT_PRICE);
    });

    it("should set correct owner", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("should set correct payment token", async function () {
      expect(await nft.paymentToken()).to.equal(await token.getAddress());
    });

    it("should start with 0 minted", async function () {
      expect(await nft.totalMinted()).to.equal(0);
    });

    it("should revert with zero address token", async function () {
      const WhitePanther = await ethers.getContractFactory("WhitePanther");
      await expect(
        WhitePanther.deploy(ethers.ZeroAddress, MINT_PRICE, owner.address),
      ).to.be.revertedWithCustomError(nft, "ZeroAddress");
    });

    it("should revert with zero price", async function () {
      const WhitePanther = await ethers.getContractFactory("WhitePanther");
      await expect(
        WhitePanther.deploy(await token.getAddress(), 0, owner.address),
      ).to.be.revertedWithCustomError(nft, "InvalidPrice");
    });
  });

  // ═══════════════════════════════════════
  //  Minting
  // ═══════════════════════════════════════

  describe("Minting", function () {
    it("should mint single NFT", async function () {
      await nft.connect(user1).mint(1);
      expect(await nft.balanceOf(user1.address)).to.equal(1);
      expect(await nft.ownerOf(0)).to.equal(user1.address);
    });

    it("should mint multiple NFTs", async function () {
      await nft.connect(user1).mint(5);
      expect(await nft.balanceOf(user1.address)).to.equal(5);
      expect(await nft.totalMinted()).to.equal(5);
    });

    it("should transfer correct ERC-20 amount", async function () {
      const balanceBefore = await token.balanceOf(user1.address);
      await nft.connect(user1).mint(3);
      const balanceAfter = await token.balanceOf(user1.address);
      expect(balanceBefore - balanceAfter).to.equal(MINT_PRICE * 3n);
    });

    it("should emit Minted event", async function () {
      await expect(nft.connect(user1).mint(2))
        .to.emit(nft, "Minted")
        .withArgs(user1.address, 2, MINT_PRICE * 2n);
    });

    it("should revert on zero quantity", async function () {
      await expect(nft.connect(user1).mint(0)).to.be.revertedWithCustomError(
        nft,
        "ZeroQuantity",
      );
    });

    it("should revert on exceeding max per tx", async function () {
      await expect(nft.connect(user1).mint(11)).to.be.revertedWithCustomError(
        nft,
        "ExceedsMaxPerTx",
      );
    });

    it("should revert when paused", async function () {
      await nft.pause();
      await expect(nft.connect(user1).mint(1)).to.be.revertedWithCustomError(
        nft,
        "EnforcedPause",
      );
    });

    it("should revert without ERC-20 approval", async function () {
      await token.mint(user2.address, ethers.parseUnits("1000", 18));
      // user2 has NOT approved
      await expect(nft.connect(user2).mint(1)).to.be.reverted;
    });
  });

  // ═══════════════════════════════════════
  //  Owner Functions
  // ═══════════════════════════════════════

  describe("Owner Functions", function () {
    it("should update mint price", async function () {
      const newPrice = ethers.parseUnits("200", 18);
      await expect(nft.setMintPrice(newPrice))
        .to.emit(nft, "MintPriceUpdated")
        .withArgs(MINT_PRICE, newPrice);
      expect(await nft.mintPrice()).to.equal(newPrice);
    });

    it("should revert setting zero price", async function () {
      await expect(nft.setMintPrice(0)).to.be.revertedWithCustomError(
        nft,
        "InvalidPrice",
      );
    });

    it("should update payment token", async function () {
      const MockERC20 = await ethers.getContractFactory("MockERC20");
      const newToken = await MockERC20.deploy();
      const newTokenAddr = await newToken.getAddress();

      await expect(nft.setPaymentToken(newTokenAddr)).to.emit(
        nft,
        "PaymentTokenUpdated",
      );
      expect(await nft.paymentToken()).to.equal(newTokenAddr);
    });

    it("should update base URI", async function () {
      await nft.setBaseURI("ipfs://QmTest/");
      // Mint an NFT to check tokenURI
      await nft.connect(user1).mint(1);
      expect(await nft.tokenURI(0)).to.equal("ipfs://QmTest/0");
    });

    it("should withdraw tokens", async function () {
      // Mint NFT to deposit tokens in contract
      await nft.connect(user1).mint(3);
      const contractBalance = await token.balanceOf(await nft.getAddress());
      const ownerBalanceBefore = await token.balanceOf(owner.address);

      await expect(nft.withdrawTokens())
        .to.emit(nft, "TokensWithdrawn")
        .withArgs(owner.address, contractBalance);

      const ownerBalanceAfter = await token.balanceOf(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(contractBalance);
    });

    it("should revert withdraw with no balance", async function () {
      await expect(nft.withdrawTokens()).to.be.revertedWithCustomError(
        nft,
        "NoTokensToWithdraw",
      );
    });

    it("should pause and unpause", async function () {
      await nft.pause();
      await expect(nft.connect(user1).mint(1)).to.be.revertedWithCustomError(
        nft,
        "EnforcedPause",
      );

      await nft.unpause();
      await nft.connect(user1).mint(1);
      expect(await nft.balanceOf(user1.address)).to.equal(1);
    });
  });

  // ═══════════════════════════════════════
  //  Access Control
  // ═══════════════════════════════════════

  describe("Access Control", function () {
    it("should revert non-owner setting price", async function () {
      await expect(
        nft.connect(user1).setMintPrice(ethers.parseUnits("50", 18)),
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });

    it("should revert non-owner pause", async function () {
      await expect(nft.connect(user1).pause()).to.be.revertedWithCustomError(
        nft,
        "OwnableUnauthorizedAccount",
      );
    });

    it("should revert non-owner withdraw", async function () {
      await expect(
        nft.connect(user1).withdrawTokens(),
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });
  });

  // ═══════════════════════════════════════
  //  View Functions
  // ═══════════════════════════════════════

  describe("View Functions", function () {
    it("should return correct remaining supply", async function () {
      expect(await nft.remainingSupply()).to.equal(MAX_SUPPLY);
      await nft.connect(user1).mint(5);
      expect(await nft.remainingSupply()).to.equal(MAX_SUPPLY - 5n);
    });

    it("should return correct total minted", async function () {
      await nft.connect(user1).mint(3);
      expect(await nft.totalMinted()).to.equal(3);
    });
  });
});
