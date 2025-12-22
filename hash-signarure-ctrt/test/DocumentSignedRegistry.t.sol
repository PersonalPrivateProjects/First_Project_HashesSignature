// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/DocumentSignedRegistry.sol";
// import {ECDSA} from "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";

contract DocumentSignedRegistryTest is Test {
    DocumentSignedRegistry public registry;
    address signer;
    uint256 signerPrivateKey;

    function setUp() public {
        // Inicializamos el contrato
        registry = new DocumentSignedRegistry();

        // Creamos una cuenta ficticia para firmar documentos
        signerPrivateKey = 0xA11CE; // clave privada simulada
        signer = vm.addr(signerPrivateKey);
    }

    function testStoreAndVerifyDocument() public {
        // Creamos un hash ficticio de documento
        bytes32 docHash = keccak256("Documento de prueba");

        // Firmamos el hash con la clave privada simulada
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(docHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);

         // Timestamp ficticio
        uint256 timestamp = block.timestamp;

        // Guardamos el documento en el contrato
        registry.storeDocumentHash(docHash, timestamp, signature, signer);

        // Verificamos que el documento existe
        assertTrue(registry.isDocumentStored(docHash));

        // Verificamos que la firma es válida
        bool isValid = registry.verifyDocument(docHash, signer, signature);
        assertTrue(isValid);

        // Verificamos que el contador de documentos aumentó
        assertEq(registry.getDocumentCount(), 1);
    }

    function testFailInvalidSignature() public {
        // Hash ficticio
        bytes32 docHash = keccak256("Documento invalido");

        // Firma inválida (bytes vacíos)
        bytes memory badSignature = "";

        // Timestamp ficticio
        uint256 timestamp = block.timestamp;

        // Esto debería revertir porque la firma no es válida
        registry.storeDocumentHash(docHash, timestamp, badSignature, signer);
    }
}
