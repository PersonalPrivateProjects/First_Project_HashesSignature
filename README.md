# Aprendizajes Clave del Proyecto Blockchain

Este documento resume los conocimientos adquiridos durante el desarrollo del primer proyecto blockchain basado en el contrato **DocumentSignedRegistry.sol**. Incluye conceptos fundamentales, buenas prácticas y detalles técnicos relevantes.

---

## ✅ 1. Recuperación segura del firmante usando ECDSA
En Solidity, es posible recuperar la dirección del firmante a partir del **hash del documento** y la **firma**:

```solidity
address recovered = ECDSA.recover(ethSignedMessageHash, _signature);
```

- La firma ECDSA contiene suficiente información para reconstruir la clave pública y derivar la dirección.
- **Importante**: usar `MessageHashUtils.toEthSignedMessageHash` para aplicar el prefijo estándar de Ethereum antes de la recuperación, evitando ataques de replay.

---

## ✅ 2. Eliminación de documentos y trazabilidad en blockchain
- Aunque se puede eliminar un documento del `mapping` en el contrato, **la transacción que ejecuta la eliminación queda registrada en la blockchain**.
- La blockchain es inmutable: cualquier acción (guardar, eliminar) deja un rastro público.
- **Implicación**: no es posible borrar el historial; la red garantiza evidencia auditable.

---

## ✅ 3. Conexión de contratos con ethers.js
Para interactuar con un contrato desde JavaScript/TypeScript:

- **Dirección del contrato**: ubicación en la red.
- **ABI (Application Binary Interface)**: describe funciones, eventos y tipos del contrato. Permite codificar/decodificar llamadas.
- **Provider**: conexión RPC hacia la red (local con Anvil, testnet como Sepolia, o mainnet).

Ejemplo:
```ts
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/YOUR_KEY");
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Para escribir en la blockchain:
const signer = provider.getSigner();
const contractWithSigner = contract.connect(signer);
```

---

## ✅ 4. Relación entre llave privada y cuenta
- Una **llave privada** puede derivar la **dirección pública** (cuenta).
- La dirección se obtiene aplicando funciones hash sobre la clave pública, que se deriva de la clave privada.
- **Nunca compartas la llave privada**: quien la posee controla los fondos y permisos.

---

## ✅ 5. Gas, eventos y uso de Signer
- Las funciones que **escriben en la blockchain** (modifican estado o emiten eventos) **consumen gas** y requieren un **Signer** para firmar la transacción.
- Si llamas a la función **sin Signer** (solo con `provider`), la lógica puede ejecutarse **como simulación** (read-only), pero:
  - No se registra en la blockchain.
  - No se emiten eventos on-chain.

Esto es útil para verificar resultados antes de enviar la transacción.

---

## 🔍 Complementos importantes
- **Gas Fees**: dependen de la complejidad de la función y del estado de la red.
- **Eventos**: son logs almacenados en la blockchain y consultables por aplicaciones.
- **Seguridad**: validar firmas y direcciones en el contrato para evitar registros fraudulentos.
- **ABI**: se genera automáticamente al compilar el contrato con herramientas como Foundry o Hardhat.

---

## ✅ Buenas prácticas
- Usar librerías auditadas como **OpenZeppelin** para criptografía y utilidades.
- Probar funciones críticas con `forge test -vv` antes de desplegar.
- Mantener claves privadas seguras y nunca exponerlas en código fuente.
- Documentar el flujo de firma y verificación para usuarios y desarrolladores.

---

### Recursos recomendados
- [Documentación de ethers.js](https://docs.ethers.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Foundry Book](https://book.getfoundry.sh/)

