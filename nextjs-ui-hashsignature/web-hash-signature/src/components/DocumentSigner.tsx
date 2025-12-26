
"use client"

import { useState, useEffect } from "react"
import { PenTool, CheckCircle, AlertCircle, Loader2, Shield, ExternalLink, Upload, ClipboardCopy } from "lucide-react"
import { useMetaMask } from "../hooks/useMetaMask"
import { useContract } from "../hooks/useContract"
import { useTheme } from "next-themes"
import clsx from "clsx"

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

  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [copiedSigner, setCopiedSigner] = useState(false); // Estado para controlar el copiado

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Evita flash incorrecto de tema en SSR
    return null
  }

  const getCurrentTimestamp = () => Math.floor(Date.now() / 1000)

  const handleSign = async () => {
    if (!documentHash) {
      alert("Please upload a file first")
      return
    }
    if (!isConnected || !account) {
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
    if (!confirmed) return

    setIsSigning(true)
    setSignature("")
    setTimestamp(0)
    setTxHash("")

    try {
      const sig = await signMessage(message)
      const ts = getCurrentTimestamp()
      setSignature(sig)
      setTimestamp(ts)
      onSigned?.(sig, ts)
      alert(`✅ Document signed successfully!\n\nSignature: ${sig.substring(0, 20)}...${sig.substring(sig.length - 20)}`)
    } catch (err: any) {
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
    if (!confirmed) return

    setIsStoring(true)
    setTxHash("")
    try {
      const tx = await storeDocumentHash(documentHash, timestamp, signature, account)
      setTxHash(tx || "")
      if (tx) alert(`✅ Document stored successfully on blockchain!\n\nTransaction Hash: ${tx}`)
    } catch (err: any) {
      alert(`❌ Error storing on blockchain: ${err.message}`)
    } finally {
      setIsStoring(false)
    }
  }

  const reset = () => {
    setSignature("");
    setTimestamp(0);
    setTxHash("");
    setCopiedSigner(false);
  }

  
// ⬇️ NUEVO: copiar signer al portapapeles con fallback
  const handleCopySigner = async () => {
    if (!account) return
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(account)
      } else {
        // Fallback: crea un input temporal
        const input = document.createElement("input")
        input.value = account
        document.body.appendChild(input)
        input.select()
        document.execCommand("copy")
        document.body.removeChild(input)
      }
      setCopiedSigner(true)
      setTimeout(() => setCopiedSigner(false), 1500)
    } catch (e) {
      alert("Could not copy signer to clipboard")
    }
  }


  return (
    <div className="relative group">
      {/* Fondo con gradiente: ajustado por tema */}
      <div
        className={clsx(
          "rounded-xl shadow-lg border p-8 group-hover:opacity-30 blur-xl transition-all duration-500",
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200",
        )}
      />

      <div
        className={clsx(
          "relative rounded-2xl overflow-hidden border",
          theme === "dark"
            ? "bg-slate-950 border-slate-800"
            : "bg-white border-gray-200",
        )}
      >
        {/* Header */}
        <div
          className={clsx(
            "relative border-b px-8 py-6",
            theme === "dark"
              ? "border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900"
              : "border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={clsx(
                    "absolute inset-0 rounded-lg blur-md opacity-50",
                    theme === "dark" ? "bg-violet-500" : "bg-indigo-400",
                  )}
                />
                <div
                  className={clsx(
                    "relative p-3 border rounded-lg",
                    theme === "dark"
                      ? "bg-slate-900 border-violet-500/30"
                      : "bg-white border-indigo-300",
                  )}
                >
                  <PenTool className={clsx("w-6 h-6", theme === "dark" ? "text-violet-400" : "text-indigo-600")} />
                </div>
              </div>
              <div>
                <h2 className={clsx("text-xl font-bold tracking-tight", theme === "dark" ? "text-white" : "text-gray-900")}>
                  SIGN
                </h2>
                <p className={clsx("text-xs font-mono mt-0.5", theme === "dark" ? "text-slate-400" : "text-gray-500")}>
                  Digital Signature
                </p>
              </div>
            </div>

            {isConnected && account && (
              <div
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 border rounded-full",
                  theme === "dark"
                    ? "bg-slate-900 border-emerald-500/30"
                    : "bg-emerald-50 border-emerald-200",
                )}
              >
                <div className={clsx("w-1.5 h-1.5 rounded-full", theme === "dark" ? "bg-emerald-400" : "bg-emerald-500")} />
                <span className={clsx("text-xs font-mono", theme === "dark" ? "text-emerald-400" : "text-emerald-700")}>
                  CONNECTED
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-8">
          {!isConnected ? (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div
                  className={clsx(
                    "absolute inset-0 rounded-full blur-2xl opacity-20",
                    theme === "dark" ? "bg-amber-500" : "bg-yellow-400",
                  )}
                />
                <div
                  className={clsx(
                    "relative p-6 border rounded-full",
                    theme === "dark"
                      ? "bg-slate-900 border-amber-500/30"
                      : "bg-white border-yellow-300",
                  )}
                >
                  <AlertCircle className={clsx("w-12 h-12", theme === "dark" ? "text-amber-400" : "text-yellow-600")} />
                </div>
              </div>
              <h3 className={clsx("text-lg font-mono font-bold mb-2", theme === "dark" ? "text-white" : "text-gray-900")}>
                WALLET NOT CONNECTED
              </h3>
              <p className={clsx("text-sm max-w-md mx-auto", theme === "dark" ? "text-slate-400" : "text-gray-600")}>
                Connect your wallet to sign documents
              </p>
            </div>
          ) : !documentHash ? (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div
                  className={clsx(
                    "absolute inset-0 rounded-full blur-2xl opacity-20",
                    theme === "dark" ? "bg-blue-500" : "bg-indigo-400",
                  )}
                />
                <div
                  className={clsx(
                    "relative p-6 border rounded-full",
                    theme === "dark"
                      ? "bg-slate-900 border-blue-500/30"
                      : "bg-white border-indigo-300",
                  )}
                >
                  <Upload className={clsx("w-12 h-12", theme === "dark" ? "text-blue-400" : "text-indigo-600")} />
                </div>
              </div>
              <h3 className={clsx("text-lg font-mono font-bold mb-2", theme === "dark" ? "text-white" : "text-gray-900")}>
                NO DOCUMENT
              </h3>
              <p className={clsx("text-sm max-w-md mx-auto", theme === "dark" ? "text-slate-400" : "text-gray-600")}>
                Upload a file to generate hash
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Hash del documento */}
              <div
                className={clsx(
                  "relative overflow-hidden rounded-lg border p-5",
                  theme === "dark" ? "bg-slate-900 border-slate-700" : "bg-gray-50 border-gray-200",
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={clsx(
                      "p-1.5 border rounded",
                      theme === "dark"
                        ? "bg-violet-500/10 border-violet-500/30"
                        : "bg-indigo-100 border-indigo-200",
                    )}
                  >
                    <Shield className={clsx("w-3.5 h-3.5", theme === "dark" ? "text-violet-400" : "text-indigo-600")} />
                  </div>
                  <span className={clsx("text-xs font-mono uppercase tracking-wider", theme === "dark" ? "text-slate-500" : "text-gray-500")}>
                    Document Hash
                  </span>
                </div>
                <code className={clsx("block text-sm font-mono break-all leading-relaxed", theme === "dark" ? "text-slate-300" : "text-gray-800")}>
                  {documentHash}
                </code>
              </div>

              {!signature && (
                <button onClick={handleSign} disabled={isSigning} className="w-full relative group/btn overflow-hidden">
                  <div
                    className={clsx(
                      "absolute -inset-1 rounded-lg opacity-70 blur transition-all duration-300 group-hover/btn:opacity-100",
                      theme === "dark"
                        ? "bg-gradient-to-r from-violet-600 to-purple-600"
                        : "bg-gradient-to-r from-indigo-500 to-purple-500",
                    )}
                  />
                  <div
                    className={clsx(
                      "relative flex items-center justify-center gap-3 px-6 py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed",
                      theme === "dark"
                        ? "bg-gradient-to-r from-violet-500 to-purple-500"
                        : "bg-gradient-to-r from-indigo-500 to-purple-500",
                    )}
                  >
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
                  <div
                    className={clsx(
                      "relative overflow-hidden rounded-lg border p-6",
                      theme === "dark"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-emerald-200 bg-emerald-50",
                    )}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className={clsx(
                          "p-3 border rounded-lg",
                          theme === "dark"
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-emerald-100 border-emerald-200",
                        )}
                      >
                        <CheckCircle className={clsx("w-5 h-5", theme === "dark" ? "text-emerald-400" : "text-emerald-700")} />
                      </div>
                      <div>
                        <h3 className={clsx("font-mono font-bold", theme === "dark" ? "text-emerald-400" : "text-emerald-700")}>
                          SIGNED
                        </h3>
                        <p className={clsx("text-xs", theme === "dark" ? "text-slate-400" : "text-gray-600")}>
                          Document signed successfully
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div
                        className={clsx(
                          "backdrop-blur-sm rounded-lg p-3 border",
                          theme === "dark" ? "bg-slate-900/50 border-slate-700" : "bg-gray-50 border-gray-200",
                        )}
                      >
                        <span className={clsx("text-xs font-mono uppercase tracking-wider block mb-2", theme === "dark" ? "text-slate-500" : "text-gray-500")}>
                          Signature
                        </span>
                        <code className={clsx("block text-xs font-mono break-all leading-relaxed", theme === "dark" ? "text-slate-300" : "text-gray-800")}>
                          {signature}
                        </code>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                          className={clsx(
                            "backdrop-blur-sm rounded-lg p-3 border",
                            theme === "dark" ? "bg-slate-900/50 border-slate-700" : "bg-gray-50 border-gray-200",
                          )}
                        >
                          <span className={clsx("text-xs font-mono uppercase tracking-wider block mb-2", theme === "dark" ? "text-slate-500" : "text-gray-500")}>
                            Timestamp
                          </span>
                          <span className={clsx("text-sm font-mono", theme === "dark" ? "text-slate-300" : "text-gray-800")}>
                            {new Date(timestamp * 1000).toLocaleString()}
                          </span>
                        </div>

                        <div
                          className={clsx(
                            "backdrop-blur-sm rounded-lg p-3 border",
                            theme === "dark" ? "bg-slate-900/50 border-slate-700" : "bg-gray-50 border-gray-200",
                          )}
                        >
                       <div className="flex items-center justify-between mb-2">
                          <span className={clsx("text-xs font-mono uppercase tracking-wider block mb-2", theme === "dark" ? "text-slate-500" : "text-gray-500")}>
                            Signer
                          </span>


                          <ClipboardCopy
                            onClick={handleCopySigner}                            
                            role="button"
                            aria-label={copiedSigner ? "Copied!" : "Copy signer"}
                            tabIndex={0}
                            className={clsx(
                              "w-5 h-5 cursor-pointer rounded border p-1 transition-colors",
                              theme === "dark"
                                ? (copiedSigner ? "text-emerald-400 border-slate-700 bg-slate-800" : "text-slate-300 border-slate-700 hover:bg-slate-800")
                                : (copiedSigner ? "text-emerald-700 border-gray-300 bg-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-200"),
                            )}                            
                          />
                        </div>
 

                          <code className={clsx("text-xs font-mono break-all", theme === "dark" ? "text-slate-300" : "text-gray-800")}>
                            {account}
                          </code>
                          
                            
                            {/* <button
                              onClick={handleCopySigner}
                              title={copiedSigner ? "Copied!" : "Copy signer"}
                              className={clsx(
                                "p-2 rounded border transition-colors flex-shrink-0 ml-10",
                                theme === "dark"
                                  ? "bg-slate-900/50 border-slate-700 hover:bg-slate-800"
                                  : "bg-gray-100 border-gray-300 hover:bg-gray-200",
                              )}
                            >
                              <ClipboardCopy
                                className={clsx("w-4 h-4", theme === "dark" ? (copiedSigner ? "text-emerald-400" : "text-slate-300") : (copiedSigner ? "text-emerald-600" : "text-gray-700"))}
                              />
                            </button> */}

                        </div>
                      </div>
                    </div>
                  </div>

                  {!txHash && (
                    <button onClick={handleStore} disabled={isStoring} className="w-full relative group/btn overflow-hidden">
                      <div
                        className={clsx(
                          "absolute -inset-1 rounded-lg opacity-70 blur transition-all duration-300 group-hover/btn:opacity-100",
                          theme === "dark"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600"
                            : "bg-gradient-to-r from-fuchsia-500 to-pink-500",
                        )}
                      />
                      <div
                        className={clsx(
                          "relative flex items-center justify-center gap-3 px-6 py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed",
                          theme === "dark"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500"
                            : "bg-gradient-to-r from-fuchsia-500 to-pink-500",
                        )}
                      >
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
                    <div
                      className={clsx(
                        "rounded-lg border p-5",
                        theme === "dark" ? "border-blue-500/30 bg-blue-500/5" : "border-blue-200 bg-blue-50",
                      )}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={clsx(
                            "p-2 border rounded-lg",
                            theme === "dark" ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-100 border-blue-200",
                          )}
                        >
                          <CheckCircle className={clsx("w-4 h-4", theme === "dark" ? "text-blue-400" : "text-blue-700")} />
                        </div>
                        <span className={clsx("font-mono font-bold", theme === "dark" ? "text-blue-400" : "text-blue-700")}>
                          ON-CHAIN
                        </span>
                      </div>
                      <div
                        className={clsx(
                          "flex items-center gap-2 rounded-lg p-3 border",
                          theme === "dark" ? "bg-slate-900/50 border-slate-700" : "bg-gray-50 border-gray-200",
                        )}
                      >
                        <code className={clsx("text-xs font-mono break-all flex-1", theme === "dark" ? "text-slate-300" : "text-gray-800")}>
                          {txHash}
                        </code>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={clsx(
                            "p-2 rounded transition-colors flex-shrink-0 border",
                            theme === "dark"
                              ? "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20"
                              : "bg-blue-100 border-blue-200 hover:bg-blue-200",
                          )}
                        >
                          <ExternalLink className={clsx("w-4 h-4", theme === "dark" ? "text-blue-400" : "text-blue-700")} />
                        </a>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={reset}
                    className={clsx(
                      "w-full px-4 py-3 rounded-lg transition-all text-sm font-mono border",
                      theme === "dark"
                        ? "border-slate-700 text-slate-400 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-300"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900",
                    )}
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div
              className={clsx(
                "mt-6 rounded-lg border p-5",
                theme === "dark" ? "border-rose-500/30 bg-rose-500/5" : "border-rose-200 bg-rose-50",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={clsx(
                    "p-2 border rounded-lg flex-shrink-0",
                    theme === "dark" ? "bg-rose-500/10 border-rose-500/30" : "bg-rose-100 border-rose-200",
                  )}
                >
                  <AlertCircle className={clsx("w-5 h-5", theme === "dark" ? "text-rose-400" : "text-rose-700")} />
                </div>
                <div>
                  <span className={clsx("font-mono font-bold block mb-1", theme === "dark" ? "text-rose-400" : "text-rose-700")}>
                    ERROR
                  </span>
                  <p className={clsx("text-sm", theme === "dark" ? "text-slate-400" : "text-gray-700")}>{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
