# Proyecto web-hash-signature

Este proyecto es una interfaz de usuario web que utiliza el contrato **DocumentSignedRegistry** para almacenar y verificar documentos firmados en Ethereum.  

## Componentes

- **FileUploader**  
  Se encarga de subir archivos al sistema. Utiliza la función `storeDocumentHash` del contrato para almacenar:
  - El hash del archivo  
  - La fecha y hora de almacenamiento  
  - La firma del archivo  

- **DocumentSigner**  
  Se encarga de firmar documentos utilizando **MetaMask**. Usa la función `signTypedData` de MetaMask para generar la firma y luego llama a `storeDocumentHash` del contrato para almacenar el documento firmado.  

- **DocumentVerifier**  
  Verifica la firma de un documento utilizando el contrato **DocumentSignedRegistry**. Emplea la función `verifyDocument` del contrato y muestra el resultado en la interfaz de usuario.  

- **DocumentHistory**  
  Muestra el historial de documentos almacenados en el contrato. Utiliza las funciones `getDocumentInfo` y `getDocumentHashByIndex` para obtener información sobre los documentos.  

## Hooks

- **useMetaMask**  
  Maneja la integración con MetaMask. Utiliza la biblioteca **ethers.js** para interactuar con MetaMask y permite a los componentes acceder a la dirección de MetaMask y a las funciones de firma y transacción.  

- **useContract**  
  Maneja la interacción con el contrato **DocumentSignedRegistry**. Utiliza **ethers.js** para interactuar con el contrato y permite a los componentes acceder a sus funciones.  

## MetaMaskContext.tsx

Este archivo define el contexto **MetaMaskContext**, que se utiliza para compartir la información de MetaMask con los componentes que lo necesitan.  
Usa el hook `useContext` de React para acceder al contexto y permite obtener la dirección de MetaMask y las funciones de firma y transacción.  

## Ejecución del proyecto

1. Asegúrate de tener **Node.js** instalado en tu máquina.  
2. Abre una terminal y navega hasta la carpeta raíz del proyecto.  
3. Instala las dependencias:  
   ```bash
   npm install
