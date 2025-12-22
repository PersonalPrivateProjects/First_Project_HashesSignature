// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {DocumentSignedRegistry} from "../src/DocumentSignedRegistry.sol";

contract DocumentSignedRegistryScript is Script {
    DocumentSignedRegistry public registry;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // Desplegar el contrato
        registry = new DocumentSignedRegistry();

        vm.stopBroadcast();
    }
}