// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { ECDSA } from "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import { MessageHashUtils } from "openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";

 
/**
 * @title DocumentSignedRegistry
 * @notice Registro de documentos firmados off-chain (hash + firma + firmante), con verificación criptográfica ECDSA.
 * @dev Usa OpenZeppelin ECDSA y MessageHashUtils para compatibilidad con EIP-191 (Ethereum Signed Message).
 *      Permite almacenar la evidencia de una firma realizada fuera de la cadena y consultarla posteriormente.
 */

contract DocumentSignedRegistry{

// Para firmar un documento se necesita su hash, la firma y la direccion del firmante   
/**
   * @dev Estructura de datos para persistir la evidencia del documento firmado.
   * @param documentHash Hash del documento (p.ej., keccak256 del archivo).
   * @param timestamp Marca de tiempo proveída por el cliente (no necesariamente block.timestamp).
   * @param signer Dirección del firmante esperado (quien generó la firma).
   * @param signature Firma ECDSA realizada sobre el hash, usando el prefijo estándar de Ethereum.
   */

  struct Document {
    bytes32 documentHash;
    uint256 timestamp;
    address signer;
    bytes signature; 
  }

  /// @dev Almacenamiento principal indexado por hash de documento.
  mapping(bytes32 => Document) private documents;

  
  /// @dev Índice auxiliar para iterar y consultar por posición.
  bytes32[] private documentHashes;
  


 /**
   * @notice Emite cuando se almacena un documento firmado exitosamente.
   * @param documentHash Hash del documento almacenado.
   * @param signer Dirección del firmante validada.
   * @param timestamp Marca de tiempo asociada al documento.
   * @param signature Firma ECDSA sobre el hash.
   */

  event DocumentStored(
    bytes32 indexed documentHash, 
    address indexed signer, 
    uint256 timestamp, 
    bytes signature
    );
    
    
  /**
   * @notice Emite al verificar una firma para un hash y un firmante determinado.
   * @param documentHash Hash del documento verificado.
   * @param signer Dirección del firmante esperado.
   * @param isValid Resultado de la verificación (true si la dirección recuperada coincide con el firmante).
   */

  event DocumentVerified(
    bytes32 indexed documentHash,
    address indexed signer, 
    bool isValid
    );

   
   /**
   * @dev Esto es solo para propósitos ilustrativos y con fines de practica; en un sistema real, eliminar documentos puede no ser deseable.
   * @notice Emite cuando se elimina un documento del registro.
   * @param documentHash Hash del documento eliminado.
   * @param signer Dirección del firmante asociada al documento en el momento de la emisión.
   * @dev Nota: en la implementación actual, primero se marca signer = address(0) y luego se emite.
   *      Si deseas emitir el firmante original, guarda el valor previo y emite antes de poner address(0).  
   */

    event DocumentRemoved(
       bytes32 indexed documentHash,
       address indexed signer
    );

    
  // =========================
  // Modificadores y validadores
  // =========================


    
  /**
   * @dev Requiere que exista un documento para el hash dado.
   * @param _hash Hash del documento.
   * Revertirá con "Document does not exist" si no existe.
   */

    function _requireDocumentExists(bytes32 _hash) internal view {
        require(documents[_hash].signer != address(0), "Document does not exist");
    }

   
  /**
   * @dev Requiere que NO exista un documento para el hash dado.
   * @param _hash Hash del documento.
   * Revertirá con "Document already exists" si ya existe.
   */

     function _requireDocumentNotExists(bytes32 _hash) internal view {
        require(documents[_hash].signer == address(0), "Document already exists");
    }


  /**
   * @notice Exige que el documento no exista antes de continuar.
   * @param _hash Hash del documento.
   */

    modifier documentNotExists(bytes32 _hash) {
        _requireDocumentNotExists(_hash);
        _;
    }


  /**
   * @notice Exige que el documento exista antes de continuar.
   * @param _hash Hash del documento.
   */

    modifier documentExists(bytes32 _hash) {
        _requireDocumentExists(_hash);
        _;
    }
   


  // =========================
  // Lectura
  // =========================



  /**
   * @notice Obtiene la información completa de un documento por su hash.
   * @param _hash Hash del documento.
   * @return document La estructura Document almacenada.
   * @dev Requiere que el documento exista.
   */

 function getDocumentInfo(bytes32 _hash)
    external
     view 
     documentExists(_hash) returns (Document memory document){      
      return documents[_hash];
   }

    
  /**
   * @notice Obtiene únicamente la firma ECDSA asociada a un hash de documento.
   * @param _hash Hash del documento.
   * @return signature Firma ECDSA almacenada.
   * @dev Requiere que el documento exista.
   */

   function getDocumentSignature(bytes32 _hash) 
        external 
        view 
        documentExists(_hash) 
        returns (bytes memory signature) 
    {
        return documents[_hash].signature;
    }


  // =========================
  // Escritura
  // =========================



  /**
   * @notice Almacena un nuevo documento firmado si la firma corresponde al firmante esperado.
   * @param _hash Hash del documento (bytes32), típicamente derivado del contenido del archivo (keccak256).
   * @param _timestamp Marca de tiempo proveída por el cliente (puede no coincidir con block.timestamp).
   * @param _signature Firma ECDSA generada off-chain usando el prefijo estándar (signMessage) sobre el hash.
   * @param _signer Dirección del firmante esperado (quien realizó la firma).
   * @dev Valida criptográficamente con `ECDSA.recover` sobre `toEthSignedMessageHash(_hash)`.
   *      Requiere que el documento no exista previamente.
   *      Diseñado para flujos donde el registrante puede ser distinto del firmante (no usa msg.sender).
   *      Emite `DocumentStored` al finalizar.
   */

   function storeDocumentHash(
    bytes32 _hash,
    uint256 _timestamp,
    bytes calldata _signature, 
    address _signer
    ) external 
      documentNotExists(_hash) {  
      // Validar que la firma corresponde al signer
      // HAsh con prefijo estandar Ethereum EIP-191, "\x19Ethereum Signed Message:\n32" + originalHash
      bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(_hash); // permite agregar el prefijo estandar de Ethereum
      address recovered = ECDSA.recover(ethSignedMessageHash, _signature); // Recupera la direccion del firmante desde la firma y el hash

      require(recovered == _signer, "Invalid signature");
      
      Document memory newDocument = Document({
          documentHash: _hash,
          timestamp: _timestamp, //  El cliente puede mentir sobre el timestamp, pero es irrelevante para la verificacion de la firma, puede usarse blobk.timestamp si se quiere
          signer: _signer, 
          signature: _signature        
      });
  
      documents[_hash] = newDocument;
      documentHashes.push(_hash);
      emit DocumentStored(_hash, _signer, _timestamp, _signature);
   } 
 

  
  /**
   * @notice Verifica criptográficamente si la firma corresponde al firmante esperado para un hash dado.
   * @param _hash Hash del documento a verificar.
   * @param _signer Dirección del firmante esperado.
   * @param _signature Firma ECDSA generada off-chain sobre el hash (con prefijo estándar).
   * @return isValid `true` si la dirección recuperada coincide con `_signer`.
   * @dev Este método no requiere que el documento esté previamente almacenado; sirve para verificación puntual.
   *      Emite `DocumentVerified` con el resultado.
   */

  function verifyDocument(
    bytes32 _hash, 
    address _signer, 
    bytes memory _signature
    ) external
     returns (bool isValid) {
     if(_signer == address(0) || _signature.length == 0){
       isValid = false;
     }else{
        // Prefijo estándar Ethereum: toEthSignedMessageHash es ideal para hashe binarios (hash proviene de archivos)
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(_hash);
        // Recuperar dirección del firmante a partir de la firma y el hash
        address recovered = ECDSA.recover(ethSignedMessageHash, _signature);
        isValid = recovered == _signer;
     } 
  
     emit DocumentVerified(_hash, _signer, isValid);
     return isValid;
  }


  // =========================
  // Utilidades de consulta
  // =========================



  /**
   * @notice Indica si existe un documento para el hash dado.
   * @param _hash Hash del documento.
   * @return exists `true` si el documento existe (signer != address(0)).
   */

 function isDocumentStored(bytes32 _hash)
  external
  view
   returns (bool exists) {
     return documents[_hash].signer != address(0);
 }


  /**
   * @notice Devuelve la cantidad total de documentos almacenados.
   * @return count Número de elementos en `documentHashes`.
   */

 function getDocumentCount() external view returns(uint256 count){  
   return documentHashes.length;
 }


  /**
   * @notice Obtiene el hash de documento por índice.
   * @param _index Índice en el arreglo auxiliar `documentHashes`.
   * @return hash Hash (`bytes32`) en la posición solicitada.
   * @dev Requiere que el índice esté dentro de rango.
   */

 function getDocumentHashByIndex(uint256 _index)
 external
 view 
 returns(bytes32 hash){
 require(_index < documentHashes.length, "Index out of bounds");   
   return documentHashes[_index];
 }


  // =========================
  // Eliminación
  // =========================


 /**
   * Esto es solo para propósitos ilustrativos y con fines de practica; en un sistema real, eliminar documentos puede no ser deseable.
   * @notice SOLO de Elimina un documento del registro y remueve su hash del índice.
   * @param _hash Hash del documento a eliminar.
   * @dev Requiere que el documento exista.
   *      Usa `_removeHashFromArray` (swap + pop) para eficiencia.
   *      Emite `DocumentRemoved` (actualmente con signer = address(0); ver nota en el evento).
   */

 function removeDocument(bytes32 _hash) external documentExists(_hash) {
   require(documentHashes.length > 0, "Not documentos in storage");    
    // Use internal helper to clean array
    _removeHashFromArray(_hash);
    documents[_hash].signer = address(0);
    emit DocumentRemoved(_hash, documents[_hash].signer);
 }


  // =========================
  // Helper interno
  // =========================

  /**
   * @notice Remueve un hash del arreglo `documentHashes` usando swap con el último y `pop()`.
   * @param _hash Hash a eliminar.
   * @dev Complejidad: búsqueda O(n) + eliminación O(1) amortizada.
   *      Para grandes volúmenes, considerar un índice `mapping(bytes32 => uint256)` para O(1) búsqueda.
   */

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