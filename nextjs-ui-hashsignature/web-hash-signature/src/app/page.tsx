"use client"

import { useState, useEffect } from "react"
import { useMetaMask } from "../hooks/useMetaMask"
import { FileUploader } from "../components/FileUploader"
import { DocumentSigner } from "../components/DocumentSigner"
import { DocumentVerifier } from "../components/DocumentVerifier"
import { DocumentHistory } from "../components/DocumentHistory"
import { FileText, Shield, CheckCircle, History, Wallet, AlertCircle } from "lucide-react"
import { useTheme } from "next-themes"
import clsx from "clsx"

export default function Home() {
  const {
    account,
    isConnected,
    connect,
    disconnect,
    isConnecting,
    error,
    switchWallet,
    currentWalletIndex,
    availableWallets,
  } = useMetaMask()
  const [activeTab, setActiveTab] = useState<"upload" | "verify" | "history">("upload")
  const [documentHash, setDocumentHash] = useState<string>("")
  const [showWalletSelector, setShowWalletSelector] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const tabs = [
    { id: "upload", label: "Upload", description: "Upload a document", icon: FileText },
    { id: "verify", label: "Verify", description: "Verify a document", icon: Shield },
    { id: "history", label: "History", description: "View document history", icon: History },
  ]

  const handleFileHash = (hash: string) => {
    setDocumentHash(hash)
  }

  const handleSigned = () => {
    // Handle document signed logic here
  }

  const toggleLightMode = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div
      className={clsx(
        "min-h-screen bg-gradient-to-br transition-colors",
        theme === "dark" ? "from-gray-900 via-gray-800 to-gray-900" : "from-blue-50 via-white to-indigo-50",
      )}
    >
      {/* Header */}
      <header
        className={clsx(
          "backdrop-blur-sm border-b sticky top-0 z-50",
          theme === "dark" ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-gray-200",
        )}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={clsx("text-xl font-bold", theme === "dark" ? "text-white" : "text-gray-900")}>
                  Document Registry
                </h1>
                <p className={clsx("text-sm", theme === "dark" ? "text-gray-300" : "text-gray-600")}>
                  Blockchain Document Verification
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleLightMode}
                className={clsx(
                  "px-3 py-2 rounded-lg hover:transition-colors rounded-full",
                  theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300 text-gray-700",
                )}
              >
                {theme === "light" ? "dark" : "light"}
              </button>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-3">
                  <div className="relative wallet-selector-container">
                    <button
                      onClick={() => setShowWalletSelector(!showWalletSelector)}
                      className={clsx(
                        "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                        theme === "dark" ? "bg-green-900/30 hover:bg-green-900/50" : "bg-green-100 hover:bg-green-200",
                      )}
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span
                        className={clsx("text-sm font-medium", theme === "dark" ? "text-green-200" : "text-green-800")}
                      >
                        Wallet {currentWalletIndex}: {account?.slice(0, 6)}...{account?.slice(-4)}
                      </span>
                      <svg
                        className={clsx("w-4 h-4", theme === "dark" ? "text-green-200" : "text-green-800")}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showWalletSelector && (
                      <div
                        className={clsx(
                          "absolute right-0 mt-2 w-80 rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto",
                          theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
                        )}
                      >
                        <div className={clsx("p-3 border-b", theme === "dark" ? "border-gray-700" : "border-gray-200")}>
                          <h3
                            className={clsx("text-sm font-semibold", theme === "dark" ? "text-white" : "text-gray-900")}
                          >
                            Select Anvil Wallet
                          </h3>
                        </div>
                        <div className="p-2">
                          {availableWallets.map((wallet) => (
                            <button
                              key={wallet.index}
                              onClick={() => {
                                switchWallet(wallet.index)
                                setShowWalletSelector(false)
                              }}
                              className={clsx(
                                "w-full text-left px-3 py-2 rounded-md mb-1 transition-colors",
                                currentWalletIndex === wallet.index
                                  ? theme === "dark"
                                    ? "bg-blue-900/30 text-blue-100"
                                    : "bg-blue-100 text-blue-900"
                                  : theme === "dark"
                                    ? "hover:bg-gray-700 text-gray-300"
                                    : "hover:bg-gray-100 text-gray-700",
                              )}
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
                    className={clsx(
                      "px-4 py-2 text-sm font-medium transition-colors",
                      theme === "dark" ? "text-gray-300 hover:text-red-400" : "text-gray-700 hover:text-red-600",
                    )}
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
                    <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
                  </button>
                  {showWalletSelector && !isConnected && (
                    <div
                      className={clsx(
                        "absolute right-0 mt-2 w-80 rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto",
                        theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
                      )}
                    >
                      <div className={clsx("p-3 border-b", theme === "dark" ? "border-gray-700" : "border-gray-200")}>
                        <h3
                          className={clsx("text-sm font-semibold", theme === "dark" ? "text-white" : "text-gray-900")}
                        >
                          Select Anvil Wallet
                        </h3>
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
                            className={clsx(
                              "w-full text-left px-3 py-2 rounded-md mb-1 transition-colors disabled:opacity-50",
                              theme === "dark" ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700",
                            )}
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
          <h2 className={clsx("text-4xl font-bold mb-4", theme === "dark" ? "text-white" : "text-gray-900")}>
            Secure Document Verification
          </h2>
          <p className={clsx("text-xl max-w-3xl mx-auto", theme === "dark" ? "text-gray-300" : "text-gray-600")}>
            Store, sign, and verify document hashes on the blockchain with complete transparency and security.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div
          className={clsx(
            "rounded-xl shadow-lg border mb-8",
            theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className={clsx("border-b", theme === "dark" ? "border-gray-700" : "border-gray-200")}>
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={clsx(
                      "flex items-center space-x-3 py-6 px-1 border-b-2 font-medium text-sm transition-all duration-200",
                      activeTab === tab.id
                        ? theme === "dark"
                          ? "border-blue-500 text-blue-400"
                          : "border-blue-500 text-blue-600"
                        : theme === "dark"
                          ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div>{tab.label}</div>
                      <div
                        className={clsx("text-xs font-normal", theme === "dark" ? "text-gray-400" : "text-gray-500")}
                      >
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
        <div
          className={clsx(
            "rounded-xl shadow-lg border p-8",
            theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          {!isConnected ? (
            <div className="text-center py-16">
              <div
                className={clsx(
                  "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
                  theme === "dark" ? "bg-yellow-900/30" : "bg-yellow-100",
                )}
              >
                <AlertCircle className={clsx("w-10 h-10", theme === "dark" ? "text-yellow-400" : "text-yellow-600")} />
              </div>
              <h3 className={clsx("text-2xl font-semibold mb-4", theme === "dark" ? "text-white" : "text-gray-900")}>
                Connect Your Wallet
              </h3>
              <p className={clsx("mb-8 max-w-md mx-auto", theme === "dark" ? "text-gray-300" : "text-gray-600")}>
                Please select an Anvil wallet to access the dApp features and start verifying documents.
              </p>
              {error && (
                <div
                  className={clsx(
                    "rounded-lg p-4 mb-4 border max-w-md mx-auto",
                    theme === "dark" ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200",
                  )}
                >
                  <p className={clsx(theme === "dark" ? "text-red-200" : "text-red-800")}>{error}</p>
                </div>
              )}
              <div className="max-w-md mx-auto">
                <div
                  className={clsx(
                    "rounded-lg p-6 border",
                    theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200",
                  )}
                >
                  <h4 className={clsx("text-sm font-semibold mb-4", theme === "dark" ? "text-white" : "text-gray-900")}>
                    Select Anvil Test Wallet
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableWallets.map((wallet) => (
                      <button
                        key={wallet.index}
                        onClick={() => connect(wallet.index)}
                        disabled={isConnecting}
                        className={clsx(
                          "w-full text-left px-4 py-3 rounded-lg border transition-all disabled:opacity-50",
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700 hover:border-blue-500 hover:shadow-md"
                            : "bg-white border-gray-200 hover:border-blue-500 hover:shadow-md",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div
                              className={clsx("text-sm font-medium", theme === "dark" ? "text-white" : "text-gray-900")}
                            >
                              Wallet {wallet.index}
                            </div>
                            <div
                              className={clsx(
                                "text-xs font-mono",
                                theme === "dark" ? "text-gray-400" : "text-gray-600",
                              )}
                            >
                              {wallet.address}
                            </div>
                          </div>
                          <Wallet className="w-5 h-5 text-blue-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "upload" && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className={clsx("text-2xl font-bold mb-2", theme === "dark" ? "text-white" : "text-gray-900")}>
                      Upload & Sign Document
                    </h2>
                    <p className={clsx(theme === "dark" ? "text-gray-300" : "text-gray-600")}>
                      Upload a file, generate its hash, and sign it with your wallet
                    </p>
                  </div>
                  <FileUploader onFileHash={handleFileHash} />
                  <DocumentSigner documentHash={documentHash} onSigned={handleSigned} />
                </div>
              )}

              {activeTab === "verify" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className={clsx("text-2xl font-bold mb-2", theme === "dark" ? "text-white" : "text-gray-900")}>
                      Verify Document
                    </h2>
                    <p className={clsx(theme === "dark" ? "text-gray-300" : "text-gray-600")}>
                      Verify a document's authenticity by providing the file and signer address
                    </p>
                  </div>
                  <DocumentVerifier />
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className={clsx("text-2xl font-bold mb-2", theme === "dark" ? "text-white" : "text-gray-900")}>
                      Document History
                    </h2>
                    <p className={clsx(theme === "dark" ? "text-gray-300" : "text-gray-600")}>
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
