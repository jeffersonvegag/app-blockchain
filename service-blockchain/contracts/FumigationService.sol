// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FumigationService is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _appointmentIds;
    Counters.Counter private _certificateIds;
    
    struct Appointment {
        uint256 id;
        address cliente;
        string serviceType;
        uint256 appointmentDate;
        string serviceAddress;
        string comments;
        AppointmentStatus status;
        uint256 createdAt;
        uint256 completedAt;
        uint256 certificateId;
    }
    
    enum AppointmentStatus {
        Pending,
        Approved,
        InProgress,
        Completed,
        Cancelled
    }
    
    mapping(uint256 => Appointment) public appointments;
    mapping(address => uint256[]) public clientAppointments;
    mapping(uint256 => string) public certificateURIs;
    
    event AppointmentCreated(
        uint256 indexed appointmentId,
        address indexed cliente,
        string serviceType,
        uint256 appointmentDate
    );
    
    event AppointmentStatusUpdated(
        uint256 indexed appointmentId,
        AppointmentStatus status
    );
    
    event CertificateIssued(
        uint256 indexed appointmentId,
        uint256 indexed certificateId,
        address indexed cliente
    );
    
    constructor() ERC721("FumigationCertificate", "FUMCERT") {}
    
    function createAppointment(
        address _cliente,
        string memory _serviceType,
        uint256 _appointmentDate,
        string memory _serviceAddress,
        string memory _comments
    ) public onlyOwner returns (uint256) {
        _appointmentIds.increment();
        uint256 appointmentId = _appointmentIds.current();
        
        appointments[appointmentId] = Appointment({
            id: appointmentId,
            cliente: _cliente,
            serviceType: _serviceType,
            appointmentDate: _appointmentDate,
            serviceAddress: _serviceAddress,
            comments: _comments,
            status: AppointmentStatus.Pending,
            createdAt: block.timestamp,
            completedAt: 0,
            certificateId: 0
        });
        
        clientAppointments[_cliente].push(appointmentId);
        
        emit AppointmentCreated(appointmentId, _cliente, _serviceType, _appointmentDate);
        
        return appointmentId;
    }
    
    function updateAppointmentStatus(
        uint256 _appointmentId,
        AppointmentStatus _status
    ) public onlyOwner {
        require(_appointmentId <= _appointmentIds.current(), "Invalid appointment ID");
        
        appointments[_appointmentId].status = _status;
        
        if (_status == AppointmentStatus.Completed) {
            appointments[_appointmentId].completedAt = block.timestamp;
            _issueCertificate(_appointmentId);
        }
        
        emit AppointmentStatusUpdated(_appointmentId, _status);
    }
    
    function _issueCertificate(uint256 _appointmentId) internal {
        _certificateIds.increment();
        uint256 certificateId = _certificateIds.current();
        
        Appointment storage appointment = appointments[_appointmentId];
        appointment.certificateId = certificateId;
        
        _safeMint(appointment.cliente, certificateId);
        
        string memory certificateURI = generateCertificateURI(
            _appointmentId,
            certificateId,
            appointment.serviceType,
            appointment.completedAt
        );
        
        _setTokenURI(certificateId, certificateURI);
        certificateURIs[certificateId] = certificateURI;
        
        emit CertificateIssued(_appointmentId, certificateId, appointment.cliente);
    }
    
    function generateCertificateURI(
        uint256 _appointmentId,
        uint256 _certificateId,
        string memory _serviceType,
        uint256 _completedAt
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _encodeBase64(bytes(string(abi.encodePacked(
                '{"name":"Fumigation Certificate #',
                _toString(_certificateId),
                '","description":"Certificate for ',
                _serviceType,
                ' service completed","attributes":[{"trait_type":"Service Type","value":"',
                _serviceType,
                '"},{"trait_type":"Appointment ID","value":"',
                _toString(_appointmentId),
                '"},{"trait_type":"Completion Date","value":"',
                _toString(_completedAt),
                '"}]}'
            ))))
        ));
    }
    
    function getAppointment(uint256 _appointmentId) public view returns (Appointment memory) {
        require(_appointmentId <= _appointmentIds.current(), "Invalid appointment ID");
        return appointments[_appointmentId];
    }
    
    function getClientAppointments(address _cliente) public view returns (uint256[] memory) {
        return clientAppointments[_cliente];
    }
    
    function getTotalAppointments() public view returns (uint256) {
        return _appointmentIds.current();
    }
    
    function getTotalCertificates() public view returns (uint256) {
        return _certificateIds.current();
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    function _encodeBase64(bytes memory data) internal pure returns (string memory) {
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        
        if (data.length == 0) return "";
        
        string memory result = new string(4 * ((data.length + 2) / 3));
        bytes memory resultBytes = bytes(result);
        
        uint256 i = 0;
        uint256 j = 0;
        
        for (; i + 3 <= data.length; i += 3) {
            uint256 a = uint256(uint8(data[i]));
            uint256 b = uint256(uint8(data[i + 1]));
            uint256 c = uint256(uint8(data[i + 2]));
            
            uint256 bitmap = (a << 16) | (b << 8) | c;
            
            resultBytes[j++] = bytes1(uint8(bytes(table)[bitmap >> 18]));
            resultBytes[j++] = bytes1(uint8(bytes(table)[(bitmap >> 12) & 63]));
            resultBytes[j++] = bytes1(uint8(bytes(table)[(bitmap >> 6) & 63]));
            resultBytes[j++] = bytes1(uint8(bytes(table)[bitmap & 63]));
        }
        
        if (i < data.length) {
            uint256 a = uint256(uint8(data[i]));
            uint256 b = (i + 1 < data.length) ? uint256(uint8(data[i + 1])) : 0;
            
            uint256 bitmap = (a << 16) | (b << 8);
            
            resultBytes[j++] = bytes1(uint8(bytes(table)[bitmap >> 18]));
            resultBytes[j++] = bytes1(uint8(bytes(table)[(bitmap >> 12) & 63]));
            resultBytes[j++] = (i + 1 < data.length) ? bytes1(uint8(bytes(table)[(bitmap >> 6) & 63])) : "=";
            resultBytes[j++] = "=";
        }
        
        return result;
    }
}