import { ethers } from 'ethers'

export class HashUtils {
  /**
   * Calculate SHA-256 hash of file content
   * @param file File object
   * @returns Promise<string> Hash string
   */
  static async calculateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    return ethers.keccak256(uint8Array);
  }

  /**
   * Calculate SHA-256 hash of string content
   * @param content String content
   * @returns string Hash string
   */
  static calculateStringHash(content: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(content))
  }

  /**
   * Calculate hash of multiple values
   * @param values Array of values to hash
   * @returns string Combined hash
   */
  static calculateCombinedHash(values: string[]): string {
    const combined = values.join('')
    return ethers.keccak256(ethers.toUtf8Bytes(combined))
  }

  /**
   * Validate hash format
   * @param hash Hash string to validate
   * @returns boolean True if valid hash format
   */
  static isValidHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash)
  }

  /**
   * Compare two hashes
   * @param hash1 First hash
   * @param hash2 Second hash
   * @returns boolean True if equal
   */
  static compareHashes(hash1: string, hash2: string): boolean {
    return hash1.toLowerCase() === hash2.toLowerCase()
  }

  /**
   * Get hash from file name and content
   * @param fileName File name
   * @param fileContent File content
   * @returns string Hash string
   */
  static async getFileHash(fileName: string, fileContent: File): Promise<string> {
    const contentHash = await this.calculateFileHash(fileContent)
    const nameHash = this.calculateStringHash(fileName)
    return this.calculateCombinedHash([contentHash, nameHash])
  }

  /**
   * Format hash for display
   * @param hash Hash string
   * @param length Display length (default: 8)
   * @returns string Formatted hash
   */
  static formatHash(hash: string, length: number = 8): string {
    if (!hash) return ''
    return `${hash.slice(0, length)}...${hash.slice(-length)}`
  }
}