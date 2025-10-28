// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DatasetNFT
 * @dev NFT contract for tokenizing datasets with AI verification and marketplace functionality
 */
contract DatasetNFT is ERC721, ERC721URIStorage, AccessControl, ReentrancyGuard {
    // ============ State Variables ============
    
    uint256 private _tokenIdCounter;
    
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // Royalty percentage for original creators (5%)
    uint256 public constant ROYALTY_PERCENTAGE = 5;

    // ============ Enums ============
    
    enum VerificationStatus {
        PENDING,
        VERIFIED,
        FAILED,
        REJECTED
    }

    // ============ Structs ============
    
    struct DatasetInfo {
        string ipfsCid;           // IPFS CID of encrypted dataset
        uint8 aiScore;            // AI quality score (0-100)
        VerificationStatus status; // Current verification status
        string name;              // Dataset name
        string description;       // Dataset description
        uint256 createdAt;        // Timestamp of creation
        address originalCreator;  // Original dataset creator
    }

    struct ListingInfo {
        address seller;           // Current seller
        uint256 price;            // Price in wei (native token)
        address currencyToken;    // Token address (address(0) for native)
        bool isActive;            // Whether listing is active
        uint256 listedAt;         // Timestamp when listed
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

    event ListedForSale(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        address currencyToken,
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

    // ============ Constructor ============
    
    constructor() ERC721("DatasetNFT", "DNFT") {
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
        require(owner != address(0), "Invalid owner");
        require(bytes(_ipfsCid).length > 0, "IPFS CID cannot be empty");
        require(bytes(_name).length > 0, "Name cannot be empty");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        // Mint the NFT
        _safeMint(owner, tokenId);

        // Store metadata
        datasetMetadata[tokenId] = DatasetInfo({
            ipfsCid: _ipfsCid,
            aiScore: 0,
            status: VerificationStatus.PENDING,
            name: _name,
            description: _description,
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
        require(_exists(tokenId), "Token does not exist");
        require(score <= 100, "Score must be between 0 and 100");

        DatasetInfo storage dataset = datasetMetadata[tokenId];
        dataset.aiScore = score;
        dataset.status = status;

        emit VerificationUpdated(tokenId, score, status, block.timestamp);
    }

    // ============ Marketplace Functions ============
    
    /**
     * @dev List a dataset NFT for sale
     * @param tokenId Token ID to list
     * @param price Price in wei (native token)
     * @param currencyToken Token address (address(0) for native token)
     */
    function listForSale(
        uint256 tokenId,
        uint256 price,
        address currencyToken
    ) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the token owner");
        require(price > 0, "Price must be greater than zero");
        require(!listings[tokenId].isActive, "Already listed");

        // Create listing
        listings[tokenId] = ListingInfo({
            seller: msg.sender,
            price: price,
            currencyToken: currencyToken,
            isActive: true,
            listedAt: block.timestamp
        });

        emit ListedForSale(tokenId, msg.sender, price, currencyToken, block.timestamp);
    }

    /**
     * @dev Buy a listed dataset NFT (for native token payments)
     * @param tokenId Token ID to purchase
     */
    function buyDataset(uint256 tokenId) public payable nonReentrant {
        require(_exists(tokenId), "Token does not exist");
        
        ListingInfo storage listing = listings[tokenId];
        require(listing.isActive, "Not listed for sale");
        require(listing.currencyToken == address(0), "Must use native token");
        require(msg.value >= listing.price, "Insufficient payment");

        address seller = listing.seller;
        uint256 price = listing.price;

        // Verify seller still owns the token
        require(ownerOf(tokenId) == seller, "Seller no longer owns token");

        // Calculate royalty for original creator
        address creator = datasetMetadata[tokenId].originalCreator;
        uint256 royaltyAmount = 0;
        if (creator != seller && creator != address(0)) {
            royaltyAmount = (price * ROYALTY_PERCENTAGE) / 100;
        }
        uint256 sellerAmount = price - royaltyAmount;

        // Mark listing as inactive before transfers (CEI pattern - Effects)
        listing.isActive = false;

        // Transfer NFT to buyer (Effects)
        _transfer(seller, msg.sender, tokenId);

        // Transfer payment to seller (minus royalty) (Interactions)
        (bool success, ) = payable(seller).call{value: sellerAmount}("");
        require(success, "Payment transfer failed");

        // Transfer royalty to original creator (Interactions)
        if (royaltyAmount > 0) {
            (bool royaltySuccess, ) = payable(creator).call{value: royaltyAmount}("");
            require(royaltySuccess, "Royalty transfer failed");
            emit RoyaltyPaid(tokenId, creator, royaltyAmount, block.timestamp);
        }

        // Refund excess payment (Interactions)
        if (msg.value > price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(refundSuccess, "Refund failed");
        }

        emit DatasetPurchased(tokenId, msg.sender, seller, price, block.timestamp);
    }

    /**
     * @dev Cancel a listing
     * @param tokenId Token ID to cancel listing for
     */
    function cancelListing(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        
        ListingInfo storage listing = listings[tokenId];
        require(listing.isActive, "Not listed");
        require(listing.seller == msg.sender || ownerOf(tokenId) == msg.sender, "Not authorized");

        listing.isActive = false;

        emit ListingCancelled(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @dev Update listing price
     * @param tokenId Token ID to update
     * @param newPrice New price in wei
     */
    function updatePrice(uint256 tokenId, uint256 newPrice) public {
        require(_exists(tokenId), "Token does not exist");
        require(newPrice > 0, "Price must be greater than zero");
        
        ListingInfo storage listing = listings[tokenId];
        require(listing.isActive, "Not listed");
        require(listing.seller == msg.sender, "Not the seller");

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
    function getDatasetInfo(uint256 tokenId) public view returns (DatasetInfo memory) {
        require(_exists(tokenId), "Token does not exist");
        return datasetMetadata[tokenId];
    }

    /**
     * @dev Get listing information
     * @param tokenId Token ID to query
     * @return ListingInfo struct
     */
    function getListingInfo(uint256 tokenId) public view returns (ListingInfo memory) {
        require(_exists(tokenId), "Token does not exist");
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
    function getTokensByOwner(address owner) public view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIdCounter;
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }

        return tokenIds;
    }

    // ============ Admin Functions ============
    
    /**
     * @dev Grant minter role to an address (admin only)
     * @param account Address to grant role to
     */
    function grantMinterRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, account);
    }

    /**
     * @dev Grant verifier role to an address (admin only)
     * @param account Address to grant role to
     */
    function grantVerifierRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(VERIFIER_ROLE, account);
    }

    /**
     * @dev Revoke minter role from an address (admin only)
     * @param account Address to revoke role from
     */
    function revokeMinterRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, account);
    }

    /**
     * @dev Revoke verifier role from an address (admin only)
     * @param account Address to revoke role from
     */
    function revokeVerifierRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(VERIFIER_ROLE, account);
    }

    // ============ Override Functions ============
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
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
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Cancel listing if token is being transferred (not minting or burning)
        if (from != address(0) && to != address(0) && listings[tokenId].isActive) {
            listings[tokenId].isActive = false;
            emit ListingCancelled(tokenId, from, block.timestamp);
        }
        
        return super._update(to, tokenId, auth);
    }
}