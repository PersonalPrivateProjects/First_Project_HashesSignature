
# DocumentSignedRegistry

Registro sencillo de documentos firmados en Ethereum usando **ECDSA** y utilidades de OpenZeppelin. Este contrato permite almacenar el **hash** de un documento junto con su **firma**, **timestamp** y el **firmante**, así como verificar de forma criptográfica si una firma corresponde al firmante esperado.

## Estructura del contrato

### `struct Document`
- `bytes32 documentHash`: Hash del documento (contenido o identificador) que deseas registrar.
- `uint256 timestamp`: Marca de tiempo asociada al documento (provista por el caller).
- `address signer`: Dirección del firmante (no necesariamente `msg.sender`, se pasa por parámetro).
- `bytes signature`: Firma ECDSA sobre el hash.

### Eventos
- `DocumentStored(bytes32 documentHash, address signer, uint256 timestamp, bytes signature)`: Emite cuando se almacena un documento.
- `DocumentVerified(bytes32 documentHash, address signer, bool isValid)`: Emite al verificar una firma para un hash y un firmante.
- `DocumentRemoved(bytes32 documentHash, address signer)`: Emite cuando se remueve un documento del registro.

### Modificadores y helpers internos
- `_requireDocumentExists(bytes32 _hash)`: Requiere que el documento exista (signer != address(0)).
- `_requireDocumentNotExists(bytes32 _hash)`: Requiere que el documento **no** exista.
- `modifier documentNotExists(bytes32 _hash)`: Envuelve funciones que solo pueden ejecutarse si el documento no está almacenado.
- `modifier documentExists(bytes32 _hash)`: Envuelve funciones que solo pueden ejecutarse si el documento sí está almacenado.

### Funciones públicas/externas

- `getDocumentInfo(bytes32 _hash) external view returns (Document)`: Devuelve toda la información del documento almacenado para `_hash`. Requiere que exista.

- `getDocumentSignature(bytes32 _hash) external view returns (bytes)`: Devuelve únicamente la firma almacenada para el `_hash`. Requiere que exista.

- `storeDocumentHash(bytes32 _hash, uint256 _timestamp, bytes calldata _signature, address _signer) external`: 
  - **Guarda** un nuevo documento. Valida que el documento no exista previamente.
  - Verifica criptográficamente que la firma `_signature` fue generada por `_signer` sobre `_hash`, usando el prefijo estándar de Ethereum (`toEthSignedMessageHash`) y `ECDSA.recover`.
  - Si la verificación es correcta, persiste `Document` y emite `DocumentStored`.

- `verifyDocument(bytes32 _hash, address _signer, bytes memory _signature) external returns (bool)`: 
  - **Verifica** si la firma dada corresponde al firmante para el hash indicado.
  - Retorna `true` si `ECDSA.recover` coincide con `_signer` y emite `DocumentVerified`.

- `isDocumentStored(bytes32 _hash) external view returns (bool)`: Indica si existe un documento para `_hash` (si su `signer` != `address(0)`).

- `getDocumentCount() external view returns (uint256)`: Devuelve la cantidad de documentos almacenados.

- `getDocumentHashByIndex(uint256 _index) external view returns (bytes32)`: Devuelve el hash en la posición `_index` del arreglo interno `documentHashes`. Requiere que el índice sea válido.

- `removeDocument(bytes32 _hash) external`: 
  - **Elimina** el documento: quita `_hash` del arreglo `documentHashes` y marca el documento como inexistente poniendo `signer = address(0)`. 
  - Emite `DocumentRemoved`.

### Helper interno
- `_removeHashFromArray(bytes32 _hash) internal`: Busca el índice del hash en `documentHashes`, intercambia con el último elemento (si aplica) y hace `pop()` para removerlo de forma O(1) amortizada.

> **Notas**
> - En `storeDocumentHash` el parámetro `_signer` se usa explícitamente para verificar la firma y guardar el documento; esto permite registrar firmas hechas por terceros (no necesariamente `msg.sender`).
> - Tras `removeDocument`, el evento `DocumentRemoved` se emite con el `signer` que quede en el almacenamiento (en el código actual se establece `address(0)` antes de emitir). Si deseas llevar trazabilidad del firmante original, podrías emitir el evento **antes** de poner el `signer` en `address(0)` o almacenar el valor original temporalmente para el evento.

---

## Cómo correrlo localmente con **Anvil** y desplegar con `forge create`

> Requisitos: Tener **Foundry** instalado (`forge` y `anvil`). Si no lo tienes:
>
> ```bash
> curl -L https://foundry.paradigm.xyz | bash
> foundryup
> ```

1) **Inicia Anvil** (red local de Ethereum):

```bash
anvil
```

Esto arranca un nodo local en `http://127.0.0.1:8545` con cuentas y claves privadas preconfiguradas.

2) En **otra terminal**, despliega el contrato con **forge** usando la primera cuenta por defecto de Anvil:

```bash
forge create \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  src/DocumentSignedRegistry.sol:DocumentSignedRegistry \
  --broadcast
```

- `--rpc-url` apunta al nodo local.
- `--private-key` usa la clave privada de una de las cuentas de Anvil.
- `src/DocumentSignedRegistry.sol:DocumentSignedRegistry` indica ruta y nombre del contrato a desplegar.
- `--broadcast` envía la transacción al nodo.

Al finalizar, `forge` mostrará la dirección del contrato desplegado.

---

## Compilar y correr tests

- **Construir (compilar) el proyecto**:

```bash
forge build
```

- **Ejecutar pruebas** con bastante detalle:

```bash
forge test -vv
```

> Puedes agregar casos que prueben `storeDocumentHash`, `verifyDocument`, `removeDocument` y las lecturas (`getDocumentInfo`, `getDocumentSignature`, etc.).

---

## Flujo típico de uso
1. Obtén el `bytes32` del documento (por ejemplo, `keccak256` del contenido o ID).
2. Firma ese hash fuera de la cadena (wallet o script) siguiendo el esquema `toEthSignedMessageHash`.
3. Llama `storeDocumentHash(_hash, _timestamp, _signature, _signer)` para registrar.
4. Usa `verifyDocument(_hash, _signer, _signature)` para validar la correspondencia firma/firmante cuando lo necesites.
5. Consulta con `isDocumentStored`, `getDocumentCount`, `getDocumentHashByIndex` y `getDocumentInfo`.
6. Si corresponde, elimina con `removeDocument`.

---

## Dependencias
- OpenZeppelin (ECDSA y MessageHashUtils) para recuperación de firmantes y prefijo estándar:
  - `import { ECDSA } from "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";`
  - `import { MessageHashUtils } from "openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";`

Asegúrate de tener la dependencia instalada (por ejemplo, vía `forge install OpenZeppelin/openzeppelin-contracts`) o configurada en tu `foundry.toml`.

