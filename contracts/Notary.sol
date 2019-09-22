pragma solidity >=0.4.21 <0.6.0;

contract Notary {

    struct MyNotaryEntry {
        string fileName;
        uint timestamp;
        bytes32 checkSum;
        string comments;
        bool isSet;
        address setBy;
    }

    mapping (bytes32 => MyNotaryEntry) public myMapping;

    event NewEntry(bytes32 _checksum, string _filename, address indexed _setBy);

    /**
     * Example: 0x193C167E2B336B32356F17009C923C4CD33AC8E3F62BAD1384E8A049F77FD295, "test", "test"
     * "0x193C167E2B336B32356F17009C923C4CD33AC8E3F62BAD1384E8A049F77FD29", "test", "test"
     * */
    function addEntry(bytes32 _checksum, string memory _fileName, string memory _comments) public {
        require(!myMapping[_checksum].isSet,'error in solidity!');

        myMapping[_checksum].isSet = true;
        myMapping[_checksum].fileName = _fileName;
        myMapping[_checksum].timestamp = now;
        myMapping[_checksum].comments = _comments;
        myMapping[_checksum].setBy = msg.sender;
        myMapping[_checksum].checkSum = _checksum;

        emit NewEntry(_checksum, _fileName, msg.sender);
    }


    function entrySet(bytes32 _checksum) public view returns(string memory, uint, string memory, address, bytes32) {
        require(myMapping[_checksum].isSet,'error in soilidity!');
        return (myMapping[_checksum].fileName, myMapping[_checksum].timestamp, myMapping[_checksum].comments, myMapping[_checksum].setBy,myMapping[_checksum].checkSum);
    }


}
