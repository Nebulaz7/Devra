// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title DatasetNFT - Ultra Minimal for Polkadot
 * @dev Minimum viable ERC721 + Marketplace
 */

contract DatasetNFT {
    address public owner;
    uint256 private _id;

    string public constant name = "Devra";
    string public constant symbol = "DVR";

    struct Data {
        bytes32 cid;
        uint8 score;
        uint96 price;
        address creator;
        bool listed;
    }

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => Data) public data;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed id
    );
    event Minted(
        uint256 indexed id,
        address indexed owner,
        bytes32 cidHash,
        string fullCid
    );
    event Listed(uint256 indexed id, uint256 price);
    event Sold(uint256 indexed id, address indexed buyer, uint256 price);
    event Unlisted(uint256 indexed id);

    constructor() {
        owner = msg.sender;
    }

    function balanceOf(address a) external view returns (uint256) {
        return _balances[a];
    }

    function ownerOf(uint256 id) public view returns (address) {
        address a = _owners[id];
        require(a != address(0));
        return a;
    }

    function transferFrom(address from, address to, uint256 id) external {
        require(ownerOf(id) == from && msg.sender == from);
        require(to != address(0));

        _balances[from]--;
        _balances[to]++;
        _owners[id] = to;

        if (data[id].listed) {
            data[id].listed = false;
            emit Unlisted(id);
        }

        emit Transfer(from, to, id);
    }

    function mint(string calldata fullCid) external returns (uint256) {
        uint256 id = ++_id;
        bytes32 cidHash = keccak256(bytes(fullCid));

        _balances[msg.sender]++;
        _owners[id] = msg.sender;
        data[id] = Data(cidHash, 0, 0, msg.sender, false);

        emit Transfer(address(0), msg.sender, id);
        emit Minted(id, msg.sender, cidHash, fullCid);

        return id;
    }

    function setScore(uint256 id, uint8 s) external {
        require(msg.sender == owner);
        data[id].score = s;
    }

    function list(uint256 id, uint96 p) external {
        require(ownerOf(id) == msg.sender && p > 0);
        data[id].price = p;
        data[id].listed = true;
        emit Listed(id, p);
    }

    function buy(uint256 id) external payable {
        Data storage d = data[id];
        require(d.listed && msg.value >= d.price);

        address s = ownerOf(id);
        uint256 p = d.price;
        d.listed = false;

        uint256 r = (d.creator != s) ? (p * 5) / 100 : 0;

        _balances[s]--;
        _balances[msg.sender]++;
        _owners[id] = msg.sender;

        (bool ok, ) = payable(s).call{value: p - r}("");
        require(ok);

        if (r > 0) {
            (ok, ) = payable(d.creator).call{value: r}("");
            require(ok);
        }

        if (msg.value > p) {
            (ok, ) = payable(msg.sender).call{value: msg.value - p}("");
            require(ok);
        }

        emit Transfer(s, msg.sender, id);
        emit Sold(id, msg.sender, p);
    }

    function cancel(uint256 id) external {
        require(ownerOf(id) == msg.sender);
        data[id].listed = false;
        emit Unlisted(id);
    }

    function total() external view returns (uint256) {
        return _id;
    }
}
