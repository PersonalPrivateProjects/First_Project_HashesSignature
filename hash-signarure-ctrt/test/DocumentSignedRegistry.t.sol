
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {DocumentSignedRegistry} from "../src/DocumentSignedRegistry.sol";
import {MessageHashUtils} from "openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";

contract DocumentSignedRegistryTest is Test {
    DocumentSignedRegistry registry;

    // Usuarios simulados con claves privadas
    uint256 privateKey1;
    address signer1;
    uint256 privateKey2;
    address signer2;

    function setUp() public {
        registry = new DocumentSignedRegistry();

        // Claves privadas simuladas -> direcciones
        privateKey1 = 0xA11CE;
        signer1 = vm.addr(privateKey1);

        privateKey2 = 0xB0B;
        signer2 = vm.addr(privateKey2);
    }

    /// @dev Firma un bytes32 con prefijo estándar Ethereum (eth_sign)
    function _signEthMessage(bytes32 rawHash, uint256 pk) internal returns (bytes memory sig) {
        bytes32 prefixed = MessageHashUtils.toEthSignedMessageHash(rawHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, prefixed);
        return abi.encodePacked(r, s, v);
    }

    /// -----------------------------
    /// 1) Almacenar documento correctamente
    /// -----------------------------
    function testStoreDocumentCorrectly() public {
        bytes32 docHash = keccak256(bytes("doc1"));
        bytes memory sig = _signEthMessage(docHash, privateKey1);
        uint256 ts = block.timestamp;

        // Esperar evento
        vm.expectEmit(true, true, false, true);
        emit DocumentSignedRegistry.DocumentStored(docHash, signer1, ts, sig);

        registry.storeDocumentHash(docHash, ts, sig, signer1);

        // Verificar storage vía getter
        
       DocumentSignedRegistry.Document memory doc = registry.getDocumentInfo(docHash);
       assertEq(doc.documentHash, docHash, "hash incorrecto");
       assertEq(doc.timestamp, ts, "timestamp incorrecto");
       assertEq(doc.signer, signer1, "signer incorrecto");
       assertEq(doc.signature, sig, "firma incorrecta");  
    }

    /// -----------------------------
    /// 2) Verificar documento existente (firma válida)
    /// -----------------------------
    function testVerifyDocumentValid() public {
        bytes32 docHash = keccak256(bytes("doc2"));
        bytes memory sig = _signEthMessage(docHash, privateKey1);
        registry.storeDocumentHash(docHash, block.timestamp, sig, signer1);

        vm.expectEmit(true, true, false, true);
        emit DocumentSignedRegistry.DocumentVerified(docHash, signer1, true);

        bool ok = registry.verifyDocument(docHash, signer1, sig);
        assertTrue(ok, "deberia ser valido");
    }

    /// -----------------------------
    /// 3) Rechazar documentos duplicados
    /// -----------------------------
    function testRejectDuplicateDocument() public {
        bytes32 docHash = keccak256(bytes("doc3"));
        bytes memory sig = _signEthMessage(docHash, privateKey1);
        registry.storeDocumentHash(docHash, block.timestamp, sig, signer1);

        vm.expectRevert(bytes("Document already exists"));
        registry.storeDocumentHash(docHash, block.timestamp, sig, signer1);
    }

    /// -----------------------------
    /// 4) Obtener información correcta
    /// -----------------------------
    function testGetDocumentInfoReturnsCorrectData() public {
        bytes32 docHash = keccak256(bytes("doc4"));
        bytes memory sig = _signEthMessage(docHash, privateKey1);
        uint256 ts = 1_700_000_000; // ejemplo fijo
        registry.storeDocumentHash(docHash, ts, sig, signer1);

        DocumentSignedRegistry.Document memory doc = registry.getDocumentInfo(docHash);        
        assertEq(doc.documentHash, docHash);
        assertEq(doc.timestamp, ts);
        assertEq(doc.signer, signer1);
        assertEq(doc.signature, sig);

    }

    /// -----------------------------
    /// 5) Obtener firma correcta
    /// -----------------------------
    function testGetDocumentSignature() public {
        bytes32 docHash = keccak256(bytes("doc5"));
        bytes memory sig = _signEthMessage(docHash, privateKey1);
        registry.storeDocumentHash(docHash, block.timestamp, sig, signer1);

        bytes memory storedSig = registry.getDocumentSignature(docHash);
        assertEq(storedSig, sig);
    }

    /// -----------------------------
    /// 6) Contar documentos
    /// -----------------------------
    function testGetDocumentCount() public {
        bytes32 h1 = keccak256(bytes("doc6"));
        bytes32 h2 = keccak256(bytes("doc7"));
        registry.storeDocumentHash(h1, block.timestamp, _signEthMessage(h1, privateKey1), signer1);
        registry.storeDocumentHash(h2, block.timestamp, _signEthMessage(h2, privateKey2), signer2);

        uint256 count = registry.getDocumentCount();
        assertEq(count, 2, "conteo incorrecto");
    }

    /// -----------------------------
    /// 7) Iterar por índice
    /// -----------------------------
    function testGetDocumentHashByIndex() public {
        bytes32 h1 = keccak256(bytes("doc8"));
        bytes32 h2 = keccak256(bytes("doc9"));
        registry.storeDocumentHash(h1, block.timestamp, _signEthMessage(h1, privateKey1), signer1);
        registry.storeDocumentHash(h2, block.timestamp, _signEthMessage(h2, privateKey2), signer2);

        assertEq(registry.getDocumentHashByIndex(0), h1);
        assertEq(registry.getDocumentHashByIndex(1), h2);
    }

    /// -----------------------------
    /// 8) Rechazar documentos inexistentes (getters con modifier)
    /// -----------------------------
    function testGetDocumentInfoRevertsIfNotExists() public {
        bytes32 fakeHash = keccak256(bytes("fake-A"));
        vm.expectRevert(bytes("Document does not exist"));
        registry.getDocumentInfo(fakeHash);
    }

    function testGetDocumentSignatureRevertsIfNotExists() public {
        bytes32 fakeHash = keccak256(bytes("fake-B"));
        vm.expectRevert(bytes("Document does not exist"));
        registry.getDocumentSignature(fakeHash);
    }

    /// -----------------------------
    /// 9) Verificación falla con signer incorrecto
    /// -----------------------------
    function testVerifyFailsWrongSigner() public {
        bytes32 docHash = keccak256(bytes("doc10"));
        bytes memory sig = _signEthMessage(docHash, privateKey1);
        registry.storeDocumentHash(docHash, block.timestamp, sig, signer1);

        vm.expectEmit(true, true, false, true);
        emit DocumentSignedRegistry.DocumentVerified(docHash, signer2, false);

        bool ok = registry.verifyDocument(docHash, signer2, sig);
        assertFalse(ok, "deberia ser invalido");
    }

    /// -----------------------------
    /// 10) Verificación falla con firma incorrecta
    /// -----------------------------
    function testVerifyFailsWrongSignature() public {
        bytes32 docHash = keccak256(bytes("doc11"));
        bytes memory sig = _signEthMessage(docHash, privateKey1);
        registry.storeDocumentHash(docHash, block.timestamp, sig, signer1);

        // firma distinta (hash distinto)
        bytes32 otherHash = keccak256(bytes("other"));
        bytes memory badSig = _signEthMessage(otherHash, privateKey1);

        vm.expectEmit(true, true, false, true);
        emit DocumentSignedRegistry.DocumentVerified(docHash, signer1, false);

        bool ok = registry.verifyDocument(docHash, signer1, badSig);
        assertFalse(ok);
    }

    /// -----------------------------
    /// 11) storeDocumentHash revierte si la firma no corresponde al signer
    /// -----------------------------
    function testStoreDocumentRevertsInvalidSignature() public {
        bytes32 docHash = keccak256(bytes("doc12"));
        // Firmamos con privateKey2 pero pretendemos que el signer sea signer1
        bytes memory sig = _signEthMessage(docHash, privateKey2);

        vm.expectRevert(bytes("Invalid signature"));
        registry.storeDocumentHash(docHash, block.timestamp, sig, signer1);
    }

    /// -----------------------------
    /// 12) getDocumentHashByIndex revierte out of bounds
    /// -----------------------------
    function testGetDocumentHashByIndexRevertsOutOfBounds() public {
        vm.expectRevert(bytes("Index out of bounds"));
        registry.getDocumentHashByIndex(0);
    }

    /// -----------------------------
    /// 13) removeDocument: elimina y deja de existir
    /// -----------------------------
    function testRemoveDocumentDeletesStorageAndCount() public {
        bytes32 docHash = keccak256(bytes("doc13"));
        bytes memory sig = _signEthMessage(docHash, privateKey1);
        registry.storeDocumentHash(docHash, block.timestamp, sig, signer1);

        // Antes
        assertTrue(registry.isDocumentStored(docHash));      

        registry.removeDocument(docHash);
        // Después
        assertFalse(registry.isDocumentStored(docHash), "no deberia existir");        

        // Nota: el contrato actual emite DocumentRemoved con signer = address(0) por emitir tras delete.
        // Si luego corriges el contrato para emitir el signer antes de borrar, actualiza este test.
    }

    /// -----------------------------
    /// 14) removeDocument revierte si documento no existe
    /// -----------------------------
    function testRemoveDocumentRevertsIfNotExists() public {
        bytes32 fakeHash = keccak256(bytes("doc14"));
        vm.expectRevert(bytes("Document does not exist"));
        registry.removeDocument(fakeHash);
    }

    /// -----------------------------
    /// 15) removeDocument revierte si array está vacío
    /// -----------------------------
    function testRemoveDocumentRevertsIfArrayEmpty() public {
        bytes32 fakeHash = keccak256(bytes("doc15"));
        // Pasa el modifier documentExists, por lo que primero almacenamos y luego removemos para vaciar
        bytes memory sig = _signEthMessage(fakeHash, privateKey1);
        registry.storeDocumentHash(fakeHash, block.timestamp, sig, signer1);
        registry.removeDocument(fakeHash);

        // Ahora intentar remover otra vez debe fallar en modifier (no llega a este require)
        vm.expectRevert(bytes("Document does not exist"));
        registry.removeDocument(fakeHash);
    }
}
