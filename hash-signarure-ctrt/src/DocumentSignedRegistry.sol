// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { ECDSA } from "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import { MessageHashUtils } from "openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";

 
contract DocumentSignedRegistry{

   // PAra firmar un documento se necesita su hash, la firma y la direccion del firmante
  struct Document {
    bytes32 documentHash;
    uint256 timestamp;
    address signer;
    bytes signature; 
  }

  mapping(bytes32 => Document) private documents;
  bytes32[] private documentHashes;
  

  event DocumentStored(
    bytes32 indexed documentHash, 
    address indexed signer, 
    uint256 timestamp, 
    bytes signature
    );

  event DocumentVerified(
    bytes32 indexed documentHash,
    address indexed signer, 
    bool isValid
    );

   // En caso que se elimine un documento
    event DocumentRemoved(
       bytes32 indexed documentHash,
       address indexed signer
    );

      // Modifiers

     //  validar que el documento exista
    function _requireDocumentExists(bytes32 _hash) internal view {
        require(documents[_hash].signer != address(0), "Document does not exist");
    }

    // validar que el documento no exista
     function _requireDocumentNotExists(bytes32 _hash) internal view {
        require(documents[_hash].signer == address(0), "Document already exists");
    }


    modifier documentNotExists(bytes32 _hash) {
        _requireDocumentNotExists(_hash);
        _;
    }

    modifier documentExists(bytes32 _hash) {
        _requireDocumentExists(_hash);
        _;
    }
 

   function getDocumentInfo(bytes32 _hash)
    external
     view 
     documentExists(_hash)
      returns (Document memory document){      
      return documents[_hash];
   }


   function getDocumentSignature(bytes32 _hash) 
        external 
        view 
        documentExists(_hash) 
        returns (bytes memory signature) 
    {
        return documents[_hash].signature;
    }


   function storeDocumentHash(
    bytes32 _hash,
    uint256 _timestamp,
    bytes calldata _signature, 
    address _signer
    ) external 
      documentNotExists(_hash) {  
      // Validar que la firma corresponde al signer
      bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(_hash); // permite agregar el prefijo estandar de Ethereum
      address recovered = ECDSA.recover(ethSignedMessageHash, _signature); // Recupera la direccion del firmante desde la firma y el hash

      require(recovered == _signer, "Invalid signature");
  
      Document memory newDocument = Document({
          documentHash: _hash,
          timestamp: _timestamp,
          signer: _signer, // No deberia ser msg.sender ??
          signature: _signature        
      });
  
      documents[_hash] = newDocument;
      documentHashes.push(_hash);
      emit DocumentStored(_hash, _signer, _timestamp, _signature);
   } 
 

   /**
     * @dev Verify a document signature (simplified)
     * @param _hash The hash of the document
     * @param _signer The address of the signer
     * @param _signature The signature to verify
     * @return isValid True if the signature is valid
     */
    function verifyDocument(
        bytes32 _hash,
        address _signer,
        bytes memory _signature
    ) external returns (bool isValid) {
        // Verificacion simplificada: solo comprueba si el documento existe y si el firmante coincide pero no valida la firma criptograficamente
        Document memory doc = documents[_hash];
        
        if (doc.signer == address(0)) {
            isValid = false;
        } else {
            // Check if the signer matches and signature is not empty
            isValid = (doc.signer == _signer && doc.signature.length > 0 && _signature.length > 0);
        }
        
        emit DocumentVerified(_hash, _signer, isValid);
        return isValid;
    }

  // Funcion de verificacion mas segura que valida criptograficamente la firma
  function verifyDocumentV2(
    bytes32 _hash, 
    address _signer, 
    bytes calldata _signature
    ) external
     returns (bool isValid) {
     if(_signer == address(0) || _signature.length == 0){
       isValid = false;
     }else{
        // Prefijo estándar Ethereum
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(_hash);
        // Recuperar dirección del firmante a partir de la firma y el hash
        address recovered = ECDSA.recover(ethSignedMessageHash, _signature);
        isValid = recovered == _signer;
     } 
  
     emit DocumentVerified(_hash, _signer, isValid);
     return isValid;
  }


 /**
  * @dev Check if a document exists
  * @param _hash The hash of the document
  * @return exists True if the document exists
  */
 function isDocumentStored(bytes32 _hash)
  external
  view
   returns (bool exists) {
     return documents[_hash].signer != address(0);
 }


 function getDocumentCount() external view returns(uint256 count){  
   return documentHashes.length;
 }


 function getDocumentHashByIndex(uint256 _index)
 external
 view 
 returns(bytes32 hash){
 require(_index < documentHashes.length, "Index out of bounds");   
   return documentHashes[_index];
 }


 function removeDocument(bytes32 _hash) external documentExists(_hash) {
   require(documentHashes.length > 0, "Not documentos in storage");    
    // Use internal helper to clean array
    _removeHashFromArray(_hash);
    delete documents[_hash];
    emit DocumentRemoved(_hash, documents[_hash].signer);
 }


  // 🔧 Internal helper to remove a hash from the array
  function _removeHashFromArray(bytes32 _hash) internal {
     uint256 index;
     bool found = false;
     for (uint256 i = 0; i < documentHashes.length; i++) {
         if (documentHashes[i] == _hash) {
             index = i;
             found = true;
             break;
         }
     
     require(found, "Hash not found in array");
     uint256 lastIndex = documentHashes.length - 1;
     if (index != lastIndex) {
         documentHashes[index] = documentHashes[lastIndex];
     }
     documentHashes.pop();
    }
  }

}