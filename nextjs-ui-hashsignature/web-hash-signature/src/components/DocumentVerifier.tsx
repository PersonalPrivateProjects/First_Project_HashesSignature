'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, Loader2, Upload, Hash, Shield, User, Clock } from 'lucide-react'
import { useContract } from '../hooks/useContract'
import { HashUtils } from '../utils/hash'

export function DocumentVerifier() {
  const { getDocumentInfo, isDocumentStored } = useContract()
  const [file, setFile] = useState<File | null>(null)
  const [signerAddress, setSignerAddress] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean
    documentInfo: any
    error?: string
  } | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setVerificationResult(null)
    }
  }

  const handleVerify = async () => {
    if (!file) {
      alert('Please select a file to verify')
      return
    }

    if (!signerAddress.trim()) {
      alert('Please enter the signer address')
      return
    }

    setIsVerifying(true)
    setVerificationResult(null)

    try {
      console.log('🔍 Starting document verification...')
      
      // Calculate file hash
      const fileHash = await HashUtils.calculateFileHash(file)
      console.log('📝 File hash calculated:', fileHash)
      
      // Check if document exists
      console.log('🔎 Checking if document is stored...')
      const exists = await isDocumentStored(fileHash)
      console.log('✅ Document exists:', exists)
      
      if (!exists) {
        setVerificationResult({
          isValid: false,
          documentInfo: null,
          error: 'Document not found in registry. It may not have been signed and stored yet.'
        })
        return
      }

      // Get document info
      console.log('📄 Getting document info...')
      const documentInfo = await getDocumentInfo(fileHash)
      console.log('📊 Document info:', documentInfo)
      
      if (!documentInfo) {
        setVerificationResult({
          isValid: false,
          documentInfo: null,
          error: 'Document not found in blockchain'
        })
        return
      }
      
      // Verify signer matches
      const isValid = documentInfo.signer.toLowerCase() === signerAddress.toLowerCase()
      console.log('🔐 Signer verification:', { 
        expected: signerAddress.toLowerCase(), 
        actual: documentInfo.signer.toLowerCase(),
        isValid 
      })
      
      setVerificationResult({
        isValid,
        documentInfo,
        error: isValid ? undefined : 'Signer address does not match. The document was signed by a different address.'
      })
    } catch (error: any) {
      console.error('❌ Verification error:', error)
      
      let errorMessage = 'Verification failed'
      
      // Better error messages
      if (error.message.includes('could not decode result data')) {
        errorMessage = 'Contract error: Please make sure the contract is deployed and Anvil is running.'
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error: Cannot connect to Anvil. Make sure it\'s running on http://localhost:8545'
      } else {
        errorMessage = error.message || 'Verification failed'
      }
      
      setVerificationResult({
        isValid: false,
        documentInfo: null,
        error: errorMessage
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const reset = () => {
    setFile(null)
    setSignerAddress('')
    setVerificationResult(null)
  }

  return (
    <div className="space-y-6">

      <div className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select File to Verify
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-700/50">
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full"
              accept="*/*"
            />
          </div>
          {file && (
            <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <Upload className="w-4 h-4" />
              <span>Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
            </div>
          )}
        </div>

        {/* Signer Address Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Signer Address
          </label>
          <input
            type="text"
            value={signerAddress}
            onChange={(e) => setSignerAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!file || !signerAddress.trim() || isVerifying}
          className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              <span>Verify</span>
            </>
          )}
        </button>

        {/* Verification Result */}
        {verificationResult && (
          <div className={`rounded-lg p-6 border ${
            verificationResult.isValid 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              {verificationResult.isValid ? (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
              <span className={`text-lg font-semibold ${
                verificationResult.isValid 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {verificationResult.isValid ? 'Document Verified Successfully' : 'Verification Failed'}
              </span>
            </div>

            {verificationResult.error && (
              <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-700">
                <p className={`text-sm ${
                  verificationResult.isValid 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {verificationResult.error}
                </p>
              </div>
            )}

            {verificationResult.documentInfo && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Hash className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Document Hash:</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
                      <code className="text-xs font-mono text-gray-900 dark:text-white break-all">
                        {verificationResult.documentInfo.hash}
                      </code>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Signer:</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
                      <code className="text-xs font-mono text-gray-900 dark:text-white break-all">
                        {verificationResult.documentInfo.signer}
                      </code>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Timestamp:</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
                    <code className="text-sm font-mono text-gray-900 dark:text-white">
                      {new Date(Number(verificationResult.documentInfo.timestamp) * 1000).toLocaleString()}
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reset Button */}
        {(file || signerAddress || verificationResult) && (
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}