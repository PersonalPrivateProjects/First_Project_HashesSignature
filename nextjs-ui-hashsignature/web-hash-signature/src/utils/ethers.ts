import { ethers } from 'ethers'

export class EthersUtils {
  /**
   * Calculate SHA-256 hash of a file
   * @param file File object
   * @returns Promise<string> Hash string
   */
  static async calculateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const hash = ethers.keccak256(uint8Array)
    return hash
  }

  /**
   * Calculate SHA-256 hash of a string
   * @param content String content
   * @returns string Hash string
   */
  static calculateStringHash(content: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(content))
  }

  /**
   * Sign a message with a signer
   * @param message Message to sign
   * @param signer Ethers signer (Wallet or JsonRpcSigner)
   * @returns Promise<string> Signature
   */
  static async signMessage(message: string, signer: ethers.Signer): Promise<string> {
    return await signer.signMessage(message)
  }

  /**
   * Verify a signature
   * @param message Original message
   * @param signature Signature to verify
   * @param expectedAddress Expected signer address
   * @returns boolean True if signature is valid
   */
  static verifySignature(
    message: string,
    signature: string,
    expectedAddress: string
  ): boolean {
    try {
      const messageHash = ethers.hashMessage(message)
      const recoveredAddress = ethers.verifyMessage(message, signature)
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
    } catch (error) {
      console.error('Signature verification failed:', error)
      return false
    }
  }

  /**
   * Recover address from signature
   * @param message Original message
   * @param signature Signature
   * @returns string Recovered address
   */
  static recoverAddress(message: string, signature: string): string {
    try {
      return ethers.verifyMessage(message, signature)
    } catch (error) {
      console.error('Address recovery failed:', error)
      return ''
    }
  }

  /**
   * Format address for display
   * @param address Ethereum address
   * @returns string Formatted address
   */
  static formatAddress(address: string): string {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  /**
   * Validate Ethereum address
   * @param address Address to validate
   * @returns boolean True if valid
   */
  static isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address)
    } catch {
      return false
    }
  }

  /**
   * Get current timestamp
   * @returns number Current timestamp in seconds
   */
  static getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000)
  }

  /**
   * Format timestamp to readable date
   * @param timestamp Unix timestamp
   * @returns string Formatted date
   */
  static formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString()
  }
}
