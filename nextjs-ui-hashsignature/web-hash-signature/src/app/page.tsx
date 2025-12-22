'use client'

import { useState, useEffect } from 'react'
import { useMetaMask } from '../hooks/useMetaMask'
import { FileUploader } from '../components/FileUploader'
import { DocumentSigner } from '../components/DocumentSigner'
import { DocumentVerifier } from '../components/DocumentVerifier'
import { DocumentHistory } from '../components/DocumentHistory'
import { FileText, Shield, CheckCircle, History, Wallet, AlertCircle } from 'lucide-react'

export default function Home() {
  const { account, isConnected, connect, disconnect, isConnecting, error, switchWallet, currentWalletIndex, availableWallets } = useMetaMask()
  const [activeTab, setActiveTab] = useState<'upload' | 'verify' | 'history'>('upload')
  const [documentHash, setDocumentHash] = useState<string>('')
  const [showWalletSelector, setShowWalletSelector] = useState(false)

  // Debug info
  useEffect(() => {
    console.log('MetaMask Status:', { account, isConnected, isConnecting, error })
  }, [account, isConnected, isConnecting, error])

  // Close wallet selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showWalletSelector && !target.closest('.wallet-selector-container')) {
        setShowWalletSelector(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showWalletSelector])

  const tabs = [
    { id: 'upload', label: 'Upload & Sign', icon: FileText, description: 'Upload files and sign them with your wallet' },
    { id: 'verify', label: 'Verify', icon: Shield, description: 'Verify document authenticity' },
    { id: 'history', label: 'History', icon: History, description: 'View document history' }
  ]

  const handleFileHash = (hash: string) => {
    setDocumentHash(hash)
  }

  const handleSigned = (signature: string, timestamp: number) => {
    console.log('Document signed:', { signature, timestamp })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Document Registry
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Blockchain Document Verification
                </p>
              </div>
            </div>
            
            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-3">
                  <div className="relative wallet-selector-container">
                    <button
                      onClick={() => setShowWalletSelector(!showWalletSelector)}
                      className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Wallet {currentWalletIndex}: {account?.slice(0, 6)}...{account?.slice(-4)}
                      </span>
                      <svg className="w-4 h-4 text-green-800 dark:text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showWalletSelector && (
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Select Anvil Wallet</h3>
                        </div>
                        <div className="p-2">
                          {availableWallets.map((wallet) => (
                            <button
                              key={wallet.index}
                              onClick={() => {
                                switchWallet(wallet.index)
                                setShowWalletSelector(false)
                              }}
                              className={`w-full text-left px-3 py-2 rounded-md mb-1 transition-colors ${
                                currentWalletIndex === wallet.index
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-medium">Wallet {wallet.index}</div>
                                  <div className="text-xs font-mono">{wallet.address}</div>
                                </div>
                                {currentWalletIndex === wallet.index && (
                                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={disconnect}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="relative wallet-selector-container">
                  <button
                    onClick={() => setShowWalletSelector(!showWalletSelector)}
                    disabled={isConnecting}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                  </button>
                  {showWalletSelector && !isConnected && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Select Anvil Wallet</h3>
                      </div>
                      <div className="p-2">
                        {availableWallets.map((wallet) => (
                          <button
                            key={wallet.index}
                            onClick={() => {
                              connect(wallet.index)
                              setShowWalletSelector(false)
                            }}
                            disabled={isConnecting}
                            className="w-full text-left px-3 py-2 rounded-md mb-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
                          >
                            <div className="text-xs font-medium">Wallet {wallet.index}</div>
                            <div className="text-xs font-mono">{wallet.address}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Secure Document Verification
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Store, sign, and verify document hashes on the blockchain with complete transparency and security.
          </p>
        </div>

        {/* Debug Info
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-8 border border-yellow-200 dark:border-yellow-800">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Debug Info:</h3>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
              <div>Account: {account || 'None'}</div>
              <div>Connecting: {isConnecting ? 'Yes' : 'No'}</div>
              <div>Error: {error || 'None'}</div>
              <div>Document Hash: {documentHash || 'None'}</div>
              <div>Contract Address: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'Not configured'}</div>
            </div>
          </div>
        )} */}

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-3 py-6 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div>{tab.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                        {tab.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          {!isConnected ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Connect Your Wallet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                Please select an Anvil wallet to access the dApp features and start verifying documents.
              </p>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4 border border-red-200 dark:border-red-800 max-w-md mx-auto">
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}
              <div className="max-w-md mx-auto">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Select Anvil Test Wallet</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableWallets.map((wallet) => (
                      <button
                        key={wallet.index}
                        onClick={() => connect(wallet.index)}
                        disabled={isConnecting}
                        className="w-full text-left px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all disabled:opacity-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Wallet {wallet.index}</div>
                            <div className="text-xs font-mono text-gray-600 dark:text-gray-400">{wallet.address}</div>
                          </div>
                          <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'upload' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Upload & Sign Document
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Upload a file, generate its hash, and sign it with your wallet
                    </p>
                  </div>
                  <FileUploader onFileHash={handleFileHash} />
                  <DocumentSigner documentHash={documentHash} onSigned={handleSigned} />
                </div>
              )}

              {activeTab === 'verify' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Verify Document
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Verify a document's authenticity by providing the file and signer address
                    </p>
                  </div>
                  <DocumentVerifier />
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Document History
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      View all documents stored in the registry
                    </p>
                  </div>
                  <DocumentHistory />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}