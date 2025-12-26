'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'

// Anvil mnemonic (default for development)
const ANVIL_MNEMONIC = process.env.NEXT_PUBLIC_MNEMONIC || ""
console.log('ANVIL_MNEMONIC', ANVIL_MNEMONIC)
// Derive the 10 Anvil wallets from mnemonic
const ANVIL_WALLETS = Array.from({ length: 20 }, (_, i) => {
  // Create wallet from mnemonic with specific derivation path
  const path = `m/44'/60'/0'/0/${i}`
  const wallet = ethers.HDNodeWallet.fromPhrase(ANVIL_MNEMONIC, undefined, path)
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    index: i
  }
})

const RPC_URL = 'http://localhost:8545'

interface MetaMaskContextType {
  account: string | null
  isConnected: boolean
  isConnecting: boolean
  provider: ethers.JsonRpcProvider | null // leer datos de Anvil, se usuaria "ethers.BrowserProvider(window.ethereum)" para metamask real
  error: string | null
  connect: (walletIndex?: number) => Promise<void>
  disconnect: () => void
  signMessage: (message: string) => Promise<string>
  getSigner: () => Promise<ethers.Wallet>
  switchWallet: (walletIndex: number) => Promise<void>
  currentWalletIndex: number
  availableWallets: Array<{ index: number; address: string }>
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined);

export function MetaMaskProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentWalletIndex, setCurrentWalletIndex] = useState(0)

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔄 MetaMask Context state changed:', {
      account,
      isConnected,
      isConnecting,
      hasProvider: !!provider,
      error,
      currentWalletIndex
    })
  }, [account, isConnected, isConnecting, provider, error, currentWalletIndex])

  useEffect(() => {
    // Initialize provider for local Anvil
    const jsonRpcProvider = new ethers.JsonRpcProvider(RPC_URL)
    setProvider(jsonRpcProvider)
    console.log('🌐 Provider initialized:', RPC_URL)
  }, [])

  const connect = async (walletIndex: number = 0) => {
    console.log('🔌 MetaMask Context connect called with walletIndex:', walletIndex)
    
    try {
      setIsConnecting(true)
      setError(null)
      
      if (walletIndex < 0 || walletIndex >= ANVIL_WALLETS.length) {
        throw new Error('Invalid wallet index')
      }

      const wallet = ANVIL_WALLETS[walletIndex]
      console.log('📝 Wallet data:', { address: wallet.address, index: walletIndex })
      
      const jsonRpcProvider = new ethers.JsonRpcProvider(RPC_URL)
      
      console.log('🔧 Provider created')
      
      // Update all states - React will batch these updates
      setCurrentWalletIndex(walletIndex)
      setAccount(wallet.address)
      setProvider(jsonRpcProvider)
      setIsConnected(true)
      setIsConnecting(false)
      
      console.log(`✅ Connected to Anvil wallet ${walletIndex}: ${wallet.address}`)
      console.log('📊 Expected state:', {
        account: wallet.address,
        isConnected: true,
        walletIndex
      })
    } catch (error: any) {
      console.error('❌ Connection error:', error)
      setError(error.message || 'Failed to connect to Anvil wallet')
      setIsConnecting(false)
      setIsConnected(false)
      setAccount(null)
    }
  }

  const disconnect = () => {
    console.log('🔌 Disconnecting wallet')
    setAccount(null)
    setIsConnected(false)
    setError(null)
  }

  const switchWallet = async (walletIndex: number) => {
    console.log('🔄 Switching to wallet:', walletIndex)
    await connect(walletIndex)
  }

  const signMessage = async (message: string) => {
    console.log('✍️ signMessage called:', { 
      account, 
      isConnected,
      currentWalletIndex,
      message: message.substring(0, 50) + '...'
    })
    
    if (!account || !isConnected) {
      console.error('❌ Cannot sign - not connected:', { 
        account,
        isConnected,
        currentWalletIndex
      })
      throw new Error('Not connected to wallet')
    }

    try {
      console.log('🔧 Creating signer from wallet data...')
      // Create signer dynamically to avoid React state timing issues
      const wallet = ANVIL_WALLETS[currentWalletIndex]
      const jsonRpcProvider = new ethers.JsonRpcProvider(RPC_URL)
    
      // Se crea el signer con la clave privada del wallet seleccionado (cuenta de anvil perteneciente teoricamente a la misma persona que esta usando metamask) y el provider
      const walletSigner = new ethers.Wallet(wallet.privateKey, jsonRpcProvider)
      
      console.log('📝 Calling signer.signMessage...')
      // Obtenemos solo la parte del mensaje después de "Sign this message to prove you own the wallet:"
      message = message.split(":")[1].trim(); 
      console.log(`Mensaje final a firmar: ${message}`)

      // Y lo que firma es el hash del mensaje en nuestro caso el hash de un archivo
      const signature = await walletSigner.signMessage(ethers.getBytes(message));
      
      console.log('✅ Signature generated successfully:', signature.substring(0, 20) + '...')
      return signature
    } catch (error: any) {
      console.error('❌ Error in signMessage:', error)
      throw new Error(error.message || 'Failed to sign message')
    }
  }

  const getSigner = async () => {
    if (!account || !isConnected) {
      throw new Error('Not connected to wallet')
    }
    // Create signer dynamically to avoid React state timing issues
    const wallet = ANVIL_WALLETS[currentWalletIndex];
    const jsonRpcProvider = new ethers.JsonRpcProvider(RPC_URL);
    const walletSigner = new ethers.Wallet(wallet.privateKey, jsonRpcProvider);
    return walletSigner;
  }

  const value: MetaMaskContextType = {
    account,
    isConnected,
    isConnecting,
    provider,
    error,
    connect,
    disconnect,
    signMessage,
    getSigner,
    switchWallet,
    currentWalletIndex,
    availableWallets: ANVIL_WALLETS
      .filter((_, i) => i !== 0) // excluye la primera
      .map((w, i) => ({
        index: w.index, // mantiene el índice original
        address: w.address
      }))
  }

  return (
    <MetaMaskContext.Provider value={value}>
      {children}
    </MetaMaskContext.Provider>
  )
}

export function useMetaMask() {
  const context = useContext(MetaMaskContext)
  if (context === undefined) {
    throw new Error('useMetaMask must be used within a MetaMaskProvider')
  }
  return context
}
