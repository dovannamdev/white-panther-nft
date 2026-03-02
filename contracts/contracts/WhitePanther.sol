// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title WhitePanther NFT
 * @notice ERC-721 NFT collection "White Panther" — mint with ERC-20 token on Arbitrum
 * @dev Uses OpenZeppelin v5, CEI pattern, custom errors for gas optimization
 */
contract WhitePanther is
    ERC721,
    ERC721Enumerable,
    Ownable,
    Pausable,
    ReentrancyGuard
{
    using SafeERC20 for IERC20;

    // ══════════════════════════════════════════════
    //  Custom Errors (gas-optimized instead of strings)
    // ══════════════════════════════════════════════

    error ExceedsMaxSupply();
    error ExceedsMaxPerTx();
    error ZeroQuantity();
    error ZeroAddress();
    error InvalidPrice();
    error NoTokensToWithdraw();

    // ══════════════════════════════════════════════
    //  Constants & State
    // ══════════════════════════════════════════════

    uint256 public constant MAX_SUPPLY = 10_000;
    uint256 public constant MAX_PER_TX = 10;

    IERC20 public paymentToken;
    uint256 public mintPrice;
    string private _baseTokenURI;
    uint256 private _nextTokenId;

    // ══════════════════════════════════════════════
    //  Events
    // ══════════════════════════════════════════════

    event Minted(address indexed to, uint256 quantity, uint256 totalCost);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event PaymentTokenUpdated(address oldToken, address newToken);
    event BaseURIUpdated(string newBaseURI);
    event TokensWithdrawn(address indexed to, uint256 amount);

    // ══════════════════════════════════════════════
    //  Constructor
    // ══════════════════════════════════════════════

    /**
     * @param _paymentToken Address of the ERC-20 payment token
     * @param _mintPrice    Mint price per NFT (in payment token decimals)
     * @param _owner        Contract owner address
     */
    constructor(
        address _paymentToken,
        uint256 _mintPrice,
        address _owner
    ) ERC721("White Panther", "WPNFT") Ownable(_owner) {
        if (_paymentToken == address(0)) revert ZeroAddress();
        if (_mintPrice == 0) revert InvalidPrice();

        paymentToken = IERC20(_paymentToken);
        mintPrice = _mintPrice;
    }

    // ══════════════════════════════════════════════
    //  Mint
    // ══════════════════════════════════════════════

    /**
     * @notice Mint NFTs with ERC-20 token. User must approve beforehand.
     * @param quantity Number of NFTs to mint (1-10)
     */
    function mint(uint256 quantity) external whenNotPaused nonReentrant {
        // ── Checks ──
        if (quantity == 0) revert ZeroQuantity();
        if (quantity > MAX_PER_TX) revert ExceedsMaxPerTx();
        if (_nextTokenId + quantity > MAX_SUPPLY) revert ExceedsMaxSupply();

        uint256 totalCost = mintPrice * quantity;

        // ── Effects ──
        uint256 startTokenId = _nextTokenId;

        // Unchecked for loop counter — cannot overflow in practice
        unchecked {
            for (uint256 i = 0; i < quantity; i++) {
                _safeMint(msg.sender, startTokenId + i);
            }
            _nextTokenId = startTokenId + quantity;
        }

        // ── Interactions ──
        paymentToken.safeTransferFrom(msg.sender, address(this), totalCost);

        emit Minted(msg.sender, quantity, totalCost);
    }

    // ══════════════════════════════════════════════
    //  Owner Functions
    // ══════════════════════════════════════════════

    /**
     * @notice Update mint price
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        if (newPrice == 0) revert InvalidPrice();
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceUpdated(oldPrice, newPrice);
    }

    /**
     * @notice Update payment token
     */
    function setPaymentToken(address token) external onlyOwner {
        if (token == address(0)) revert ZeroAddress();
        address oldToken = address(paymentToken);
        paymentToken = IERC20(token);
        emit PaymentTokenUpdated(oldToken, token);
    }

    /**
     * @notice Set base URI for metadata
     */
    function setBaseURI(string memory uri) external onlyOwner {
        _baseTokenURI = uri;
        emit BaseURIUpdated(uri);
    }

    /**
     * @notice Withdraw all ERC-20 tokens from contract to owner
     */
    function withdrawTokens() external onlyOwner nonReentrant {
        uint256 balance = paymentToken.balanceOf(address(this));
        if (balance == 0) revert NoTokensToWithdraw();

        // CEI: emit event before transfer
        emit TokensWithdrawn(msg.sender, balance);
        paymentToken.safeTransfer(msg.sender, balance);
    }

    /**
     * @notice Pause minting
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause minting
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ══════════════════════════════════════════════
    //  View Functions
    // ══════════════════════════════════════════════

    /**
     * @notice Total number of NFTs minted
     */
    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @notice Remaining NFTs available to mint
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - _nextTokenId;
    }

    // ══════════════════════════════════════════════
    //  Overrides (required by Solidity)
    // ══════════════════════════════════════════════

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
