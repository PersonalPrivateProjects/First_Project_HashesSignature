'use client'

import { useState } from 'react'
import { PenTool, CheckCircle, AlertCircle, Loader2, Shield, ExternalLink, Upload } from 'lucide-react'
import { useMetaMask } from '../hooks/useMetaMask'
import { useContract } from '../hooks/useContract'

interface DocumentSignerProps {
  documentHash?: string
  onSigned?: (signature: string, timestamp: number) => void
}

export function DocumentSigner({ documentHash, onSigned }: DocumentSignerProps) {
  const { account, isConnected, signMessage } = useMetaMask()
  const { storeDocumentHash, isLoading, error } = useContract()
  
  const [isSigning, setIsSigning] = useState(false)
  const [isStoring, setIsStoring] = useState(false)
  const [signature, setSignature] = useState<string>('')
  const [timestamp, setTimestamp] = useState<number>(0)
  const [txHash, setTxHash] = useState<string>('')

  // Debug logging
  console.log('DocumentSigner - isConnected:', isConnected, 'account:', account)

  const getCurrentTimestamp = () => {
    return Math.floor(Date.now() / 1000)
  }

  const handleSign = async () => {
    console.log('handleSign called - documentHash:', documentHash, 'isConnected:', isConnected, 'account:', account)
    
    if (!documentHash) {
      alert('Please upload a file first')
      return
    }

    if (!isConnected || !account) {
      console.error('Not connected or no account:', { isConnected, account })
      alert('Please connect your wallet')
      return
    }

    // Confirmation alert showing what will be signed
    
    const message = `Signing document with hash: ${documentHash}`
    const confirmed = window.confirm(
      `🔐 Confirm Signature\n\n` +
      `You are about to sign the following message:\n\n` +
      `"${message}"\n\n` +
      `Signer: ${account}\n\n` +
      `Do you want to proceed?`
    )

    if (!confirmed) {
      console.log('User cancelled signing')
      return
    }

    setIsSigning(true)
    setSignature('')
    setTimestamp(0)
    setTxHash('')

    try {
      console.log('About to sign message...')
      const sig = await signMessage(message)
      console.log('Signature received:', sig)
      const ts = getCurrentTimestamp()
      
      setSignature(sig)
      setTimestamp(ts)
      onSigned?.(sig, ts)
      
      // Success notification
      alert(`✅ Document signed successfully!\n\nSignature: ${sig.substring(0, 20)}...${sig.substring(sig.length - 20)}`)
    } catch (err: any) {
      console.error('Error signing:', err)
      alert(`❌ Error signing: ${err.message}`)
    } finally {
      setIsSigning(false)
    }
  }

  const handleStore = async () => {
    if (!documentHash || !signature || !timestamp) {
      alert('Please sign the document first')
      return
    }

    if (!isConnected || !account) {
      console.error('Not connected or no account:', { isConnected, account })
      alert('Please connect your wallet')
      return
    }

    // Confirmation alert showing what will be stored
    const confirmed = window.confirm(
      `⛓️ Confirm Blockchain Storage\n\n` +
      `You are about to store the following on the blockchain:\n\n` +
      `Document Hash: ${documentHash}\n` +
      `Signer: ${account}\n` +
      `Timestamp: ${new Date(timestamp * 1000).toLocaleString()}\n` +
      `Signature: ${signature.substring(0, 20)}...${signature.substring(signature.length - 10)}\n\n` +
      `This action will require gas fees.\n\n` +
      `Do you want to proceed?`
    )

    if (!confirmed) {
      console.log('User cancelled blockchain storage')
      return
    }

    setIsStoring(true)
    setTxHash('')

    try {
      console.log('Storing document hash on blockchain...')
      // Store on blockchain with signature
      const tx = await storeDocumentHash(documentHash, timestamp, signature, account)
      console.log('Transaction hash:', tx)
      setTxHash(tx || '')
      
      // Success notification
      if (tx) {
        alert(`✅ Document stored successfully on blockchain!\n\nTransaction Hash: ${tx}`)
      }
    } catch (err: any) {
      console.error('Error storing:', err)
      alert(`❌ Error storing on blockchain: ${err.message}`)
    } finally {
      setIsStoring(false)
    }
  }

  const reset = () => {
    setSignature('')
    setTimestamp(0)
    setTxHash('')
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <PenTool className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign Document</h2>
          <p className="text-gray-600 dark:text-gray-300">Sign the document hash with your wallet</p>
          <p className="text-gray-600 dark:text-gray-300">Account: {account} {isConnected ? 'Connected' : 'Not Connected'}</p>
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Wallet Not Connected {isConnected ? 'Connected' : 'Not Connected'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please connect your wallet to sign documents
          </p>
        </div>
      ) : !documentHash ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Document Hash
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Please upload a file first to generate its hash
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Document Hash Display */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Document Hash to Sign:
            </h3>
            <code className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all bg-white dark:bg-gray-800 p-2 rounded border">
              {documentHash}
            </code>
          </div>

          {/* Sign Button */}
          {!signature && (
            <button
              onClick={handleSign}
              disabled={isSigning}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSigning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing...</span>
                </>
              ) : (
                <>
                  <PenTool className="w-5 h-5" />
                  <span>Sign Document</span>
                </>
              )}
            </button>
          )}
      
          {/* Signature Display */}
          {signature && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 text-green-700 dark:text-green-300 mb-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Document Signed Successfully!</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-green-600 dark:text-green-400">
                      Signature:
                    </label>
                    <code className="block text-xs font-mono text-green-800 dark:text-green-200 break-all bg-green-100 dark:bg-green-800 p-2 rounded mt-1">
                      {signature}
                    </code>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-green-600 dark:text-green-400">
                      Timestamp:
                    </label>
                    <code className="block text-xs font-mono text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-800 p-2 rounded mt-1">
                      {new Date(timestamp * 1000).toLocaleString()}
                    </code>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-green-600 dark:text-green-400">
                      Signer Address:
                    </label>
                    <code className="block text-xs font-mono text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-800 p-2 rounded mt-1">
                      {account}
                    </code>
                  </div>
                </div>
              </div>

              {/* Store on Blockchain Button */}
              {!txHash && (
                <button
                  onClick={handleStore}
                  disabled={isStoring}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isStoring ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Storing on Blockchain...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>Store on Blockchain</span>
                    </>
                  )}
                </button>
              )}

              {/* Transaction Hash Display */}
              {txHash && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Transaction Confirmed!</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm font-mono text-blue-800 dark:text-blue-200 break-all">
                      {txHash}
                    </code>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={reset}
                className="w-full px-6 py-3 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-300 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Error:</span>
          </div>
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
    </div>
  )
}