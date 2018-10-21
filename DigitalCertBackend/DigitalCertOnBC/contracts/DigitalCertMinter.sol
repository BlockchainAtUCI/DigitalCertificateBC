pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract DigitalCertMinter {
    using SafeMath for uint256;
    
    // Variables
    struct Items {
        string name;
        uint256 totalSupply;
        mapping (bytes32 => uint256) balances;
    }

    struct Ownership{
        uint256 ownershipTkn;
        uint256 issueDate; 
        uint256 expireDate;
    }

    // Use a split bit implementation.
    // Store the type in the upper 128 bits..
    uint256 constant TYPE_MASK = uint256(uint128(~0)) << 128;
    // ..and the non-fungible index in the lower 128
    uint256 constant NF_INDEX_MASK = uint128(~0);
    // The top bit is a flag to tell if this is a NFI.
    uint256 constant TYPE_NF_BIT = 1 << 255;
    //address internal minter;
    mapping (uint256 => address)  minters;
    mapping (bytes32 => Ownership)  ownership; 
    mapping (bytes32 => uint256)  typeDef;
    mapping (uint256 => string)  symbols;
    mapping (uint256 => Items)  items;
    mapping (uint256 => string)  metadataURIs;
    mapping (uint256 => bytes32) nfiOwners;
    mapping (uint256 => bytes32) nfiMapping; 
    uint256 nonce;
    
    event Issue(address from, bytes32 to, bytes32 cert);

    modifier minterOnly(uint256 _type) {
        address minter = minters[_type];
        require(minter == msg.sender, "The current address is not authorized to do operate it");
        _;
    }

    // This function only creates the type.
    function create(string _name, bytes32 _nameBytes, string _uri, string _symbol, bool _isNFI) external {

        // Store the type in the upper 128 bits
        uint256 _type = (++nonce << 128);

        // Set a flag if this is an NFI.
        if (_isNFI)
          _type = _type | TYPE_NF_BIT;

        // This will allow special access to minters.
        minters[_type] = msg.sender;

        // Setup the basic info.
        items[_type].name = _name;
        typeDef[_nameBytes] = _type;
        symbols[_type] = _symbol;
        metadataURIs[_type] = _uri;
    }

    //issueCert
    function issueCert (bytes32 recip, uint256 _type, bytes32 _cert, uint256 _expireDate, uint _issueDate)
    external minterOnly(_type) {
        require(isNonFungible(_type), "This type is not a proper type for the certificate");
        uint256 _startIndex = items[_type].totalSupply + 1;
        _startIndex += 1;
        uint256 _nfi = _type | _startIndex;
        Ownership memory newOnwerShip = Ownership(_nfi, _issueDate, _expireDate);
        ownership[_cert] = newOnwerShip;

        nfiOwners[_nfi] = recip;
        items[_type].balances[recip] = items[_type].balances[recip].add(1);
        items[_type].totalSupply = items[_type].totalSupply.add(1);

        emit Issue(msg.sender, recip, _cert);
    }

    //verifyCert
    function verifyCert(bytes32 _cert) external view returns (bytes32){
        require(ownership[_cert].ownershipTkn != 0, "No certificate under this account");
        if (ownership[_cert].expireDate > 0){
            require(ownership[_cert].expireDate > now, "The certificate has been expired");
        }
        //bytes32 check = nfiOwners[ownership[_cert].ownershipTkn];
        //require(_recip == check, "The certificate does not belong to the address"); //don't know why it does not work
        return nfiOwners[ownership[_cert].ownershipTkn];
    }

    // for debugging; should be deleted
    function getTypeDef(bytes32 title) public view returns (uint256){
        return typeDef[title];
    }
    function getOnwerShipTkn(bytes32 _cert) external view returns (uint256){
        return ownership[_cert].ownershipTkn;
    }

    function getOnwerShipIssueDate(bytes32 _cert) external view returns (uint256){
        return ownership[_cert].issueDate;
    }
    
    function getOnwerShipExpireDate(bytes32 _cert) external view returns (uint256){
        return ownership[_cert].expireDate;
    }
    // Optional meta data view Functions
    // consider multi-lingual support for name?
    function name(uint256 _id) external view returns (string) {
        return items[_id].name;
    }

    function symbol(uint256 _id) external view returns (string) {
        return symbols[_id];
    }

    function totalSupply(uint256 _id) external view returns (uint256) {
        return items[_id].totalSupply;
    }

    function uri(uint256 _id) external view returns (string) {
        return metadataURIs[_id];
    }
    function ownerOf(uint256 _id) external view returns (bytes32){
        return nfiOwners[_id];
    }
    // Only to make code clearer. Should not be functions
    function isNonFungible(uint256 _id) public pure returns(bool) {
        return _id & TYPE_NF_BIT == TYPE_NF_BIT;
    }
    function isFungible(uint256 _id) public pure returns(bool) {
        return _id & TYPE_NF_BIT == 0;
    }
}
