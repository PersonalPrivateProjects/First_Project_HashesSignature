"use client"

import { useState } from "react"
import { PenTool, CheckCircle, AlertCircle, Loader2, Shield, ExternalLink, Upload } from "lucide-react"
import { useMetaMask } from "../hooks/useMetaMask"
import { useContract } from "../hooks/useContract"

interface DocumentSignerProps {
  documentHash?: string
  onSigned?: (signature: string, timestamp: number) => void
}

export function DocumentSigner({ documentHash, onSigned }: DocumentSignerProps) {
  const { account, isConnected, signMessage } = useMetaMask()
  const { storeDocumentHash, isLoading, error } = useContract()

  const [isSigning, setIsSigning] = useState(false)
  const [isStoring, setIsStoring] = useState(false)
  const [signature, setSignature] = useState<string>("")
  const [timestamp, setTimestamp] = useState<number>(0)
  const [txHash, setTxHash] = useState<string>("")

  console.log("DocumentSigner - isConnected:", isConnected, "account:", account)

  const getCurrentTimestamp = () => {
    return Math.floor(Date.now() / 1000)
  }

  const handleSign = async () => {
    console.log("handleSign called - documentHash:", documentHash, "isConnected:", isConnected, "account:", account)

    if (!documentHash) {
      alert("Please upload a file first")
      return
    }

    if (!isConnected || !account) {
      console.error("Not connected or no account:", { isConnected, account })
      alert("Please connect your wallet")
      return
    }

    const message = `Signing document with hash: ${documentHash}`
    const confirmed = window.confirm(
      `🔐 Confirm Signature\n\n` +
        `You are about to sign the following message:\n\n` +
        `"${message}"\n\n` +
        `Signer: ${account}\n\n` +
        `Do you want to proceed?`,
    )

    if (!confirmed) {
      console.log("User cancelled signing")
      return
    }

    setIsSigning(true)
    setSignature("")
    setTimestamp(0)
    setTxHash("")

    try {
      console.log("About to sign message...")
      const sig = await signMessage(message)
      console.log("Signature received:", sig)
      const ts = getCurrentTimestamp()

      setSignature(sig)
      setTimestamp(ts)
      onSigned?.(sig, ts)

      alert(
        `✅ Document signed successfully!\n\nSignature: ${sig.substring(0, 20)}...${sig.substring(sig.length - 20)}`,
      )
    } catch (err: any) {
      console.error("Error signing:", err)
      alert(`❌ Error signing: ${err.message}`)
    } finally {
      setIsSigning(false)
    }
  }

  const handleStore = async () => {
    if (!documentHash || !signature || !timestamp) {
      alert("Please sign the document first")
      return
    }

    if (!isConnected || !account) {
      console.error("Not connected or no account:", { isConnected, account })
      alert("Please connect your wallet")
      return
    }

    const confirmed = window.confirm(
      `⛓️ Confirm Blockchain Storage\n\n` +
        `You are about to store the following on the blockchain:\n\n` +
        `Document Hash: ${documentHash}\n` +
        `Signer: ${account}\n` +
        `Timestamp: ${new Date(timestamp * 1000).toLocaleString()}\n` +
        `Signature: ${signature.substring(0, 20)}...${signature.substring(signature.length - 10)}\n\n` +
        `This action will require gas fees.\n\n` +
        `Do you want to proceed?`,
    )

    if (!confirmed) {
      console.log("User cancelled blockchain storage")
      return
    }

    setIsStoring(true)
    setTxHash("")

    try {
      console.log("Storing document hash on blockchain...")
      const tx = await storeDocumentHash(documentHash, timestamp, signature, account)
      console.log("Transaction hash:", tx)
      setTxHash(tx || "")

      if (tx) {
        alert(`✅ Document stored successfully on blockchain!\n\nTransaction Hash: ${tx}`)
      }
    } catch (err: any) {
      console.error("Error storing:", err)
      alert(`❌ Error storing on blockchain: ${err.message}`)
    } finally {
      setIsStoring(false)
    }
  }

  const reset = () => {
    setSignature("")
    setTimestamp(0)
    setTxHash("")
  }

  return (
    <div className="relative group">
      {/* Efecto de fondo con gradiente animado */}
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 rounded-2xl opacity-20 group-hover:opacity-30 blur-xl transition-all duration-500"></div>

      <div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Header minimalista */}
        <div className="relative border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500 rounded-lg blur-md opacity-50"></div>
                <div className="relative p-3 bg-slate-900 border border-violet-500/30 rounded-lg">
                  <PenTool className="w-6 h-6 text-violet-400" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">SIGN</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Digital Signature</p>
              </div>
            </div>
            {isConnected && account && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-emerald-500/30 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                <span className="text-xs font-mono text-emerald-400">CONNECTED</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-8">
          {!isConnected ? (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-amber-500 rounded-full blur-2xl opacity-20"></div>
                <div className="relative p-6 bg-slate-900 border border-amber-500/30 rounded-full">
                  <AlertCircle className="w-12 h-12 text-amber-400" />
                </div>
              </div>
              <h3 className="text-lg font-mono font-bold text-white mb-2">WALLET NOT CONNECTED</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">Connect your wallet to sign documents</p>
            </div>
          ) : !documentHash ? (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20"></div>
                <div className="relative p-6 bg-slate-900 border border-blue-500/30 rounded-full">
                  <Upload className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              <h3 className="text-lg font-mono font-bold text-white mb-2">NO DOCUMENT</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">Upload a file to generate hash</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Hash del documento */}
              <div className="relative overflow-hidden rounded-lg bg-slate-900 border border-slate-700 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-violet-500/10 border border-violet-500/30 rounded">
                    <Shield className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Document Hash</span>
                </div>
                <code className="block text-sm font-mono text-slate-300 break-all leading-relaxed">{documentHash}</code>
              </div>

              {!signature && (
                <button onClick={handleSign} disabled={isSigning} className="w-full relative group/btn overflow-hidden">
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg opacity-70 group-hover/btn:opacity-100 blur transition-all duration-300"></div>
                  <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSigning ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                        <span className="text-sm font-mono font-semibold text-white uppercase tracking-wider">
                          Signing...
                        </span>
                      </>
                    ) : (
                      <>
                        <PenTool className="w-5 h-5 text-white" />
                        <span className="text-sm font-mono font-semibold text-white uppercase tracking-wider">
                          Sign Document
                        </span>
                      </>
                    )}
                  </div>
                </button>
              )}

              {signature && (
                <div className="space-y-4">
                  {/* Resultado de firma */}
                  <div className="relative overflow-hidden rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-mono font-bold text-emerald-400">SIGNED</h3>
                        <p className="text-xs text-slate-400">Document signed successfully</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
                        <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block mb-2">
                          Signature
                        </span>
                        <code className="block text-xs font-mono text-slate-300 break-all leading-relaxed">
                          {signature}
                        </code>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
                          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block mb-2">
                            Timestamp
                          </span>
                          <span className="text-sm font-mono text-slate-300">
                            {new Date(timestamp * 1000).toLocaleString()}
                          </span>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
                          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block mb-2">
                            Signer
                          </span>
                          <code className="text-xs font-mono text-slate-300 break-all">{account}</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!txHash && (
                    <button
                      onClick={handleStore}
                      disabled={isStoring}
                      className="w-full relative group/btn overflow-hidden"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-70 group-hover/btn:opacity-100 blur transition-all duration-300"></div>
                      <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        {isStoring ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-white" />
                            <span className="text-sm font-mono font-semibold text-white uppercase tracking-wider">
                              Storing...
                            </span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-5 h-5 text-white" />
                            <span className="text-sm font-mono font-semibold text-white uppercase tracking-wider">
                              Store On-Chain
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                  )}

                  {txHash && (
                    <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="font-mono font-bold text-blue-400">ON-CHAIN</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
                        <code className="text-xs font-mono text-slate-300 break-all flex-1">{txHash}</code>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-500/10 border border-blue-500/30 rounded hover:bg-blue-500/20 transition-colors flex-shrink-0"
                        >
                          <ExternalLink className="w-4 h-4 text-blue-400" />
                        </a>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={reset}
                    className="w-full px-4 py-3 border border-slate-700 text-slate-400 rounded-lg hover:bg-slate-900 hover:border-slate-600 hover:text-slate-300 transition-all text-sm font-mono"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/5 p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <span className="font-mono font-bold text-rose-400 block mb-1">ERROR</span>
                  <p className="text-sm text-slate-400">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
