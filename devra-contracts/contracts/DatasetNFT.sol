// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DatasetNFT
 * @dev NFT contract for tokenizing AI-verified datasets on Polkadot Asset Hub
 * @notice Optimized for PolkaVM with minimal gas usage and secure marketplace
 */
contract DatasetNFT is
    ERC721,
    ERC721URIStorage,
    AccessControl,
    ReentrancyGuard
{
    // ============ State Variables ============

    uint256 private _tokenIdCounter;

    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    // Royalty percentage for original creators (5%)
    uint256 public constant ROYALTY_PERCENTAGE = 5;
    uint256 public constant PERCENTAGE_DENOMINATOR = 100;

    // ============ Enums ============

    enum VerificationStatus {
        PENDING,
        VERIFIED,
        FAILED,
        REJECTED
    }

    // ============ Structs ============

    struct DatasetInfo {
        string ipfsCid; // IPFS CID of encrypted dataset
        uint8 aiScore; // AI quality score (0-100)
        VerificationStatus status; // Current verification status
        string name; // Dataset name
        string description; // Dataset description
        string[] categories; // Dataset categories (e.g., ["Medicine", "NLP"])
        uint256 createdAt; // Timestamp of creation
        address originalCreator; // Original dataset creator
    }

    struct ListingInfo {
        address seller; // Current seller
        uint256 price; // Price in wei (native PAS token)
        bool isActive; // Whether listing is active
        uint256 listedAt; // Timestamp when listed
    }

    // ============ Mappings ============

    mapping(uint256 => DatasetInfo) public datasetMetadata;
    mapping(uint256 => ListingInfo) public listings;

    // ============ Events ============

    event DatasetMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string ipfsCid,
        string name,
        uint256 timestamp
    );

    event VerificationUpdated(
        uint256 indexed tokenId,
        uint8 aiScore,
        VerificationStatus status,
        uint256 timestamp
    );

    event CategoriesUpdated(
        uint256 indexed tokenId,
        string[] categories,
        uint256 timestamp
    );

    event ListedForSale(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );

    event DatasetPurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );

    event ListingCancelled(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 timestamp
    );

    event PriceUpdated(
        uint256 indexed tokenId,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp
    );

    event RoyaltyPaid(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 amount,
        uint256 timestamp
    );

    // ============ Errors ============

    error InvalidOwner();
    error EmptyIPFSCID();
    error EmptyName();
    error TokenDoesNotExist();
    error InvalidScore();
    error NotTokenOwner();
    error InvalidPrice();
    error AlreadyListed();
    error NotListed();
    error InsufficientPayment();
    error SellerNoLongerOwnsToken();
    error TransferFailed();
    error NotAuthorized();

    // ============ Constructor ============

    constructor() ERC721("Devra Dataset NFT", "DEVRA") {
        // Grant the contract deployer the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Grant minter and verifier roles to deployer initially
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    // ============ Helper Functions ============

    /**
     * @dev Check if a token exists
     * @param tokenId Token ID to check
     * @return bool Whether token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // ============ Minting Functions ============

    /**
     * @dev Mint a new dataset NFT
     * @param owner Address that will own the NFT
     * @param _ipfsCid IPFS CID of the encrypted dataset
     * @param _name Name of the dataset
     * @param _description Description of the dataset
     * @return tokenId The ID of the newly minted token
     */
    function mintDataset(
        address owner,
        string memory _ipfsCid,
        string memory _name,
        string memory _description
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        if (owner == address(0)) revert InvalidOwner();
        if (bytes(_ipfsCid).length == 0) revert EmptyIPFSCID();
        if (bytes(_name).length == 0) revert EmptyName();

        unchecked {
            _tokenIdCounter++;
        }
        uint256 tokenId = _tokenIdCounter;

        // Mint the NFT
        _safeMint(owner, tokenId);

        // Initialize empty categories array
        string[] memory emptyCategories = new string[](0);

        // Store metadata
        datasetMetadata[tokenId] = DatasetInfo({
            ipfsCid: _ipfsCid,
            aiScore: 0,
            status: VerificationStatus.PENDING,
            name: _name,
            description: _description,
            categories: emptyCategories,
            createdAt: block.timestamp,
            originalCreator: owner
        });

        emit DatasetMinted(tokenId, owner, _ipfsCid, _name, block.timestamp);

        return tokenId;
    }

    // ============ Verification Functions ============

    /**
     * @dev Update verification status and AI score for a dataset
     * @param tokenId Token ID to update
     * @param score AI quality score (0-100)
     * @param status New verification status
     */
    function updateVerification(
        uint256 tokenId,
        uint8 score,
        VerificationStatus status
    ) public onlyRole(VERIFIER_ROLE) {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        if (score > 100) revert InvalidScore();

        DatasetInfo storage dataset = datasetMetadata[tokenId];
        dataset.aiScore = score;
        dataset.status = status;

        emit VerificationUpdated(tokenId, score, status, block.timestamp);
    }

    /**
     * @dev Update dataset categories
     * @param tokenId Token ID to update
     * @param _categories Array of category strings
     */
    function updateCategories(
        uint256 tokenId,
        string[] memory _categories
    ) public onlyRole(VERIFIER_ROLE) {
        if (!_exists(tokenId)) revert TokenDoesNotExist();

        DatasetInfo storage dataset = datasetMetadata[tokenId];
        dataset.categories = _categories;

        emit CategoriesUpdated(tokenId, _categories, block.timestamp);
    }

    // ============ Marketplace Functions ============

    /**
     * @dev List a dataset NFT for sale (native PAS token only)
     * @param tokenId Token ID to list
     * @param price Price in wei (12 decimals for PAS)
     */
    function listForSale(uint256 tokenId, uint256 price) public {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (price == 0) revert InvalidPrice();
        if (listings[tokenId].isActive) revert AlreadyListed();

        // Create listing
        listings[tokenId] = ListingInfo({
            seller: msg.sender,
            price: price,
            isActive: true,
            listedAt: block.timestamp
        });

        emit ListedForSale(tokenId, msg.sender, price, block.timestamp);
    }

    /**
     * @dev Buy a listed dataset NFT (native PAS token payment)
     * @param tokenId Token ID to purchase
     */
    function buyDataset(uint256 tokenId) public payable nonReentrant {
        if (!_exists(tokenId)) revert TokenDoesNotExist();

        ListingInfo storage listing = listings[tokenId];
        if (!listing.isActive) revert NotListed();
        if (msg.value < listing.price) revert InsufficientPayment();

        address seller = listing.seller;
        uint256 price = listing.price;

        // Verify seller still owns the token
        if (ownerOf(tokenId) != seller) revert SellerNoLongerOwnsToken();

        // Calculate royalty for original creator
        address creator = datasetMetadata[tokenId].originalCreator;
        uint256 royaltyAmount = 0;
        uint256 sellerAmount = price;

        if (creator != seller && creator != address(0)) {
            royaltyAmount =
                (price * ROYALTY_PERCENTAGE) /
                PERCENTAGE_DENOMINATOR;
            sellerAmount = price - royaltyAmount;
        }

        // Mark listing as inactive before transfers (CEI pattern)
        listing.isActive = false;

        // Transfer NFT to buyer
        _transfer(seller, msg.sender, tokenId);

        // Transfer payment to seller (minus royalty)
        (bool success, ) = payable(seller).call{value: sellerAmount}("");
        if (!success) revert TransferFailed();

        // Transfer royalty to original creator
        if (royaltyAmount > 0) {
            (bool royaltySuccess, ) = payable(creator).call{
                value: royaltyAmount
            }("");
            if (!royaltySuccess) revert TransferFailed();
            emit RoyaltyPaid(tokenId, creator, royaltyAmount, block.timestamp);
        }

        // Refund excess payment
        if (msg.value > price) {
            (bool refundSuccess, ) = payable(msg.sender).call{
                value: msg.value - price
            }("");
            if (!refundSuccess) revert TransferFailed();
        }

        emit DatasetPurchased(
            tokenId,
            msg.sender,
            seller,
            price,
            block.timestamp
        );
    }

    /**
     * @dev Cancel a listing
     * @param tokenId Token ID to cancel listing for
     */
    function cancelListing(uint256 tokenId) public {
        if (!_exists(tokenId)) revert TokenDoesNotExist();

        ListingInfo storage listing = listings[tokenId];
        if (!listing.isActive) revert NotListed();
        if (listing.seller != msg.sender && ownerOf(tokenId) != msg.sender) {
            revert NotAuthorized();
        }

        listing.isActive = false;

        emit ListingCancelled(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @dev Update listing price
     * @param tokenId Token ID to update
     * @param newPrice New price in wei
     */
    function updatePrice(uint256 tokenId, uint256 newPrice) public {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        if (newPrice == 0) revert InvalidPrice();

        ListingInfo storage listing = listings[tokenId];
        if (!listing.isActive) revert NotListed();
        if (listing.seller != msg.sender) revert NotAuthorized();

        uint256 oldPrice = listing.price;
        listing.price = newPrice;

        emit PriceUpdated(tokenId, oldPrice, newPrice, block.timestamp);
    }

    // ============ View Functions ============

    /**
     * @dev Get dataset information
     * @param tokenId Token ID to query
     * @return DatasetInfo struct
     */
    function getDatasetInfo(
        uint256 tokenId
    ) public view returns (DatasetInfo memory) {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        return datasetMetadata[tokenId];
    }

    /**
     * @dev Get listing information
     * @param tokenId Token ID to query
     * @return ListingInfo struct
     */
    function getListingInfo(
        uint256 tokenId
    ) public view returns (ListingInfo memory) {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        return listings[tokenId];
    }

    /**
     * @dev Get total number of minted tokens
     * @return Current token count
     */
    function getTotalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Check if a token is listed for sale
     * @param tokenId Token ID to check
     * @return bool Whether token is listed
     */
    function isListed(uint256 tokenId) public view returns (bool) {
        return listings[tokenId].isActive;
    }

    /**
     * @dev Get all token IDs owned by an address
     * @param owner Address to query
     * @return Array of token IDs
     */
    function getTokensByOwner(
        address owner
    ) public view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIdCounter;
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                tokenIds[currentIndex] = i;
                unchecked {
                    currentIndex++;
                }
            }
        }

        return tokenIds;
    }

    /**
     * @dev Get all listed datasets
     * @return Array of token IDs that are listed
     */
    function getAllListedDatasets() public view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIdCounter;

        // First, count how many are listed
        uint256 listedCount = 0;
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_exists(i) && listings[i].isActive) {
                listedCount++;
            }
        }

        // Create array and populate
        uint256[] memory listedTokenIds = new uint256[](listedCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_exists(i) && listings[i].isActive) {
                listedTokenIds[currentIndex] = i;
                unchecked {
                    currentIndex++;
                }
            }
        }

        return listedTokenIds;
    }

    // ============ Admin Functions ============

    /**
     * @dev Grant minter role to an address (admin only)
     * @param account Address to grant role to
     */
    function grantMinterRole(
        address account
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, account);
    }

    /**
     * @dev Grant verifier role to an address (admin only)
     * @param account Address to grant role to
     */
    function grantVerifierRole(
        address account
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(VERIFIER_ROLE, account);
    }

    /**
     * @dev Revoke minter role from an address (admin only)
     * @param account Address to revoke role from
     */
    function revokeMinterRole(
        address account
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, account);
    }

    /**
     * @dev Revoke verifier role from an address (admin only)
     * @param account Address to revoke role from
     */
    function revokeVerifierRole(
        address account
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(VERIFIER_ROLE, account);
    }

    // ============ Override Functions ============

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override _update to automatically cancel listings when NFT is transferred
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Cancel listing if token is being transferred (not minting or burning)
        if (
            from != address(0) && to != address(0) && listings[tokenId].isActive
        ) {
            listings[tokenId].isActive = false;
            emit ListingCancelled(tokenId, from, block.timestamp);
        }

        return super._update(to, tokenId, auth);
    }
}
