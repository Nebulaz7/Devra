// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DatasetNFT
 * @dev Ultra-minimal NFT for Polkadot Asset Hub (PolkaVM optimized)
 */
contract DatasetNFT is ERC721, Ownable {
    
    uint256 private _nextTokenId;
    
    struct Dataset {
        string cid;      // IPFS CID
        uint8 score;     // AI score 0-100
        uint256 price;   // Sale price
        address creator; // Original creator
        bool listed;     // Is listed for sale
    }

    mapping(uint256 => Dataset) public datasets;
    
    event Minted(uint256 indexed id, address owner, string cid);
    event Listed(uint256 indexed id, uint256 price);
    event Sold(uint256 indexed id, address buyer, uint256 price);
    event Scored(uint256 indexed id, uint8 score);

    constructor() ERC721("Devra", "DVR") Ownable(msg.sender) {}

    function mint(string calldata cid) external returns (uint256) {
        uint256 id = ++_nextTokenId;
        _safeMint(msg.sender, id);
        datasets[id] = Dataset(cid, 0, 0, msg.sender, false);
        emit Minted(id, msg.sender, cid);
        return id;
    }

    function setScore(uint256 id, uint8 score) external onlyOwner {
        require(score <= 100, "Invalid score");
        datasets[id].score = score;
        emit Scored(id, score);
    }

    function list(uint256 id, uint256 price) external {
        require(ownerOf(id) == msg.sender, "Not owner");
        require(price > 0, "Invalid price");
        datasets[id].price = price;
        datasets[id].listed = true;
        emit Listed(id, price);
    }

    function buy(uint256 id) external payable {
        Dataset storage ds = datasets[id];
        require(ds.listed, "Not listed");
        require(msg.value >= ds.price, "Insufficient payment");
        
        address seller = ownerOf(id);
        uint256 price = ds.price;
        ds.listed = false;
        
        uint256 royalty = 0;
        if (ds.creator != seller) {
            royalty = price * 5 / 100;
        }
        
        _transfer(seller, msg.sender, id);
        
        (bool s1,) = payable(seller).call{value: price - royalty}("");
        require(s1, "Transfer failed");
        
        if (royalty > 0) {
            (bool s2,) = payable(ds.creator).call{value: royalty}("");
            require(s2, "Royalty failed");
        }
        
        if (msg.value > price) {
            (bool s3,) = payable(msg.sender).call{value: msg.value - price}("");
            require(s3, "Refund failed");
        }
        
        emit Sold(id, msg.sender, price);
    }

    function cancel(uint256 id) external {
        require(ownerOf(id) == msg.sender, "Not owner");
        datasets[id].listed = false;
    }

    function total() external view returns (uint256) {
        return _nextTokenId;
    }

    function myTokens() external view returns (uint256[] memory) {
        uint256 balance = balanceOf(msg.sender);
        uint256[] memory result = new uint256[](balance);
        uint256 counter = 0;
        
        for (uint256 i = 1; i <= _nextTokenId && counter < balance; i++) {
            if (_ownerOf(i) == msg.sender) {
                result[counter++] = i;
            }
        }
        return result;
    }

    function listed() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= _nextTokenId; i++) {
            if (datasets[i].listed) count++;
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _nextTokenId; i++) {
            if (datasets[i].listed) {
                result[index++] = i;
            }
        }
        return result;
    }
}
