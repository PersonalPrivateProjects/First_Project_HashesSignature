
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, Loader2, Upload, Hash, Shield, User, Clock } from "lucide-react"
import { useContract } from "../hooks/useContract"
import { HashUtils } from "../utils/hash"
import { useTheme } from "next-themes"
import clsx from "clsx"

export function DocumentVerifier() {
  const { getDocumentInfo, isDocumentStored } = useContract()
  const [file, setFile] = useState<File | null>(null)
  const [signerAddress, setSignerAddress] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean
    documentInfo: any
    error?: string
  } | null>(null)

  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setVerificationResult(null)
    }
  }

  const handleVerify = async () => {
    if (!file) {
      alert("Please select a file to verify")
      return
    }

    if (!signerAddress.trim()) {
      alert("Please enter the signer address")
      return
    }

    setIsVerifying(true)
    setVerificationResult(null)

    try {
      console.log("🔍 Starting document verification...")

      // Calculate file hash
      const fileHash = await HashUtils.calculateFileHash(file)
      console.log("📝 File hash calculated:", fileHash)

      // Check if document exists
      console.log("🔎 Checking if document is stored...")
      const exists = await isDocumentStored(fileHash)
      console.log("✅ Document exists:", exists)

      if (!exists) {
        setVerificationResult({
          isValid: false,
          documentInfo: null,
          error: "Document not found in registry. It may not have been signed and stored yet.",
        })
        return
      }

      // Get document info
      console.log("📄 Getting document info...")
      const documentInfo = await getDocumentInfo(fileHash)
      console.log("📊 Document info:", documentInfo)

      if (!documentInfo) {
        setVerificationResult({
          isValid: false,
          documentInfo: null,
          error: "Document not found in blockchain",
        })
        return
      }

      // Verify signer matches
      const isValid = documentInfo.signer.toLowerCase() === signerAddress.toLowerCase()
      console.log("🔐 Signer verification:", {
        expected: signerAddress.toLowerCase(),
        actual: documentInfo.signer.toLowerCase(),
        isValid,
      })

      setVerificationResult({
        isValid,
        documentInfo,
        error: isValid ? undefined : "Signer address does not match. The document was signed by a different address.",
      })
    } catch (error: any) {
      console.error("❌ Verification error:", error)

      let errorMessage = "Verification failed"

      if (error.message?.includes("could not decode result data")) {
        errorMessage = "Contract error: Please make sure the contract is deployed and Anvil is running."
      } else if (error.message?.includes("network")) {
        errorMessage = "Network error: Cannot connect to Anvil. Make sure it's running on http://localhost:8545"
      } else {
        errorMessage = error.message || "Verification failed"
      }

      setVerificationResult({
        isValid: false,
        documentInfo: null,
        error: errorMessage,
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const reset = () => {
    setFile(null)
    setSignerAddress("")
    setVerificationResult(null)
  }

  return (
    <div className="relative group">
      {/* Fondo gradiente (tema) */}
      <div
        className={clsx(
          "absolute -inset-1 rounded-2xl opacity-20 group-hover:opacity-30 blur-xl transition-all duration-500",
          theme === "dark"
            ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600"
            : "bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300",
        )}
      />

      <div
        className={clsx(
          "relative rounded-2xl overflow-hidden border",
          theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-white border-gray-200",
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
                    theme === "dark" ? "bg-cyan-500" : "bg-cyan-300",
                  )}
                />
                <div
                  className={clsx(
                    "relative p-3 border rounded-lg",
                    theme === "dark" ? "bg-slate-900 border-cyan-500/30" : "bg-white border-cyan-300",
                  )}
                >
                  <Shield className={clsx("w-6 h-6", theme === "dark" ? "text-cyan-400" : "text-cyan-700")} />
                </div>
              </div>
              <div>
                <h2 className={clsx("text-xl font-bold tracking-tight", theme === "dark" ? "text-white" : "text-gray-900")}>
                  VERIFY
                </h2>
                <p className={clsx("text-xs font-mono mt-0.5", theme === "dark" ? "text-slate-400" : "text-gray-500")}>
                  Blockchain Authentication
                </p>
              </div>
            </div>
            <div
              className={clsx(
                "flex items-center gap-2 px-3 py-1.5 border rounded-full",
                theme === "dark" ? "bg-slate-900 border-cyan-500/30" : "bg-cyan-50 border-cyan-200",
              )}
            >
              <div
                className={clsx(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  theme === "dark" ? "bg-cyan-400" : "bg-cyan-600",
                )}
              />
              <span className={clsx("text-xs font-mono", theme === "dark" ? "text-cyan-400" : "text-cyan-700")}>
                LIVE
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Input de archivo */}
          <div className="space-y-2">
            <label
              className={clsx(
                "block text-xs font-mono uppercase tracking-wider mb-3",
                theme === "dark" ? "text-slate-400" : "text-gray-600",
              )}
            >
              Document Upload
            </label>
            <div className="relative group/input">
              <div
                className={clsx(
                  "absolute -inset-0.5 rounded-lg opacity-0 group-hover/input:opacity-20 blur transition-all duration-300",
                  theme === "dark" ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "bg-gradient-to-r from-cyan-300 to-blue-300",
                )}
              />
              <div
                className={clsx(
                  "relative rounded-lg overflow-hidden border transition-all",
                  theme === "dark"
                    ? "bg-slate-900 border-slate-700 hover:border-cyan-500/50"
                    : "bg-white border-gray-300 hover:border-cyan-300",
                )}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className={clsx(
                    "w-full px-4 py-3 bg-transparent text-sm focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-mono cursor-pointer",
                    theme === "dark"
                      ? "text-slate-300 file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20"
                      : "text-gray-800 file:bg-cyan-100 file:text-cyan-700 hover:file:bg-cyan-200",
                  )}
                  accept="*/*"
                />
              </div>
            </div>

            {file && (
              <div
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg border",
                  theme === "dark" ? "bg-slate-900 border-cyan-500/30" : "bg-cyan-50 border-cyan-200",
                )}
              >
                <div
                  className={clsx(
                    "p-1.5 rounded",
                    theme === "dark" ? "bg-cyan-500/10" : "bg-cyan-100",
                  )}
                >
                  <Upload className={clsx("w-3.5 h-3.5", theme === "dark" ? "text-cyan-400" : "text-cyan-700")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={clsx("text-sm font-medium truncate", theme === "dark" ? "text-white" : "text-gray-900")}>
                    {file.name}
                  </p>
                  <p className={clsx("text-xs font-mono", theme === "dark" ? "text-slate-400" : "text-gray-600")}>
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Input de dirección */}
          <div className="space-y-2">
            <label
              className={clsx(
                "block text-xs font-mono uppercase tracking-wider mb-3",
                theme === "dark" ? "text-slate-400" : "text-gray-600",
              )}
            >
              Signer Address
            </label>
            <div className="relative group/input">
              <div
                className={clsx(
                  "absolute -inset-0.5 rounded-lg opacity-0 group-hover/input:opacity-20 blur transition-all duration-300",
                  theme === "dark" ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "bg-gradient-to-r from-cyan-300 to-blue-300",
                )}
              />
              <div
                className={clsx(
                  "relative flex items-center rounded-lg border transition-all",
                  theme === "dark"
                    ? "bg-slate-900 border-slate-700 hover:border-cyan-500/50"
                    : "bg-white border-gray-300 hover:border-cyan-300",
                )}
              >
                <div className="pl-4 pr-3">
                  <User className={clsx("w-4 h-4", theme === "dark" ? "text-slate-500" : "text-gray-500")} />
                </div>
                <input
                  type="text"
                  value={signerAddress}
                  onChange={(e) => setSignerAddress(e.target.value)}
                  placeholder="0x..."
                  className={clsx(
                    "flex-1 px-0 py-3 pr-4 bg-transparent text-sm font-mono focus:outline-none",
                    theme === "dark" ? "text-slate-300 placeholder:text-slate-600" : "text-gray-800 placeholder:text-gray-500",
                  )}
                />
              </div>
            </div>
          </div>

          {/* Botón de verificación */}
          <button
            onClick={handleVerify}
            disabled={!file || !signerAddress.trim() || isVerifying}
            className="w-full relative group/btn overflow-hidden"
          >
            <div
              className={clsx(
                "absolute -inset-1 rounded-lg opacity-70 blur transition-all duration-300 group-hover/btn:opacity-100",
                theme === "dark"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600"
                  : "bg-gradient-to-r from-cyan-400 to-blue-400",
              )}
            />
            <div
              className={clsx(
                "relative flex items-center justify-center gap-3 px-6 py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed",
                theme === "dark"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                  : "bg-gradient-to-r from-cyan-400 to-blue-400",
              )}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span className="text-sm font-mono font-semibold text-white uppercase tracking-wider">
                    Verifying...
                  </span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 text-white" />
                  <span className="text-sm font-mono font-semibold text-white uppercase tracking-wider">
                    Verify Document
                  </span>
                </>
              )}
            </div>
          </button>

          {/* Resultado de verificación */}
          {verificationResult && (
            <div
              className={clsx(
                "relative overflow-hidden rounded-lg border",
                verificationResult.isValid
                  ? theme === "dark"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-emerald-200 bg-emerald-50"
                  : theme === "dark"
                    ? "border-rose-500/30 bg-rose-500/5"
                    : "border-rose-200 bg-rose-50",
              )}
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className={clsx(
                      "p-3 rounded-lg border",
                      verificationResult.isValid
                        ? theme === "dark"
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-emerald-100 border-emerald-200"
                        : theme === "dark"
                          ? "bg-rose-500/10 border-rose-500/30"
                          : "bg-rose-100 border-rose-200",
                    )}
                  >
                    {verificationResult.isValid ? (
                      <CheckCircle className={clsx("w-6 h-6", theme === "dark" ? "text-emerald-400" : "text-emerald-700")} />
                    ) : (
                      <AlertCircle className={clsx("w-6 h-6", theme === "dark" ? "text-rose-400" : "text-rose-700")} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={clsx(
                        "text-lg font-bold mb-1 font-mono",
                        verificationResult.isValid
                          ? theme === "dark" ? "text-emerald-400" : "text-emerald-700"
                          : theme === "dark" ? "text-rose-400" : "text-rose-700",
                      )}
                    >
                      {verificationResult.isValid ? "✓ VERIFIED" : "✗ FAILED"}
                    </h3>
                    <p className={clsx("text-sm", theme === "dark" ? "text-slate-400" : "text-gray-700")}>
                      {verificationResult.isValid
                        ? "Document authenticity confirmed on-chain"
                        : verificationResult.error}
                    </p>
                  </div>
                </div>

                {verificationResult.documentInfo && (
                  <div className="space-y-3">
                    <div
                      className={clsx(
                        "backdrop-blur-sm rounded-lg p-4 border",
                        theme === "dark" ? "bg-slate-900/50 border-slate-700" : "bg-gray-50 border-gray-200",
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className={clsx("w-3.5 h-3.5", theme === "dark" ? "text-slate-500" : "text-gray-500")} />
                        <span className={clsx("text-xs font-mono uppercase tracking-wider", theme === "dark" ? "text-slate-500" : "text-gray-500")}>
                          Hash
                        </span>
                      </div>
                      <code className={clsx("block text-xs font-mono break-all leading-relaxed", theme === "dark" ? "text-slate-300" : "text-gray-800")}>
                        {verificationResult.documentInfo.hash}
                      </code>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div
                        className={clsx(
                          "backdrop-blur-sm rounded-lg p-4 border",
                          theme === "dark" ? "bg-slate-900/50 border-slate-700" : "bg-gray-50 border-gray-200",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <User className={clsx("w-3.5 h-3.5", theme === "dark" ? "text-slate-500" : "text-gray-500")} />
                          <span className={clsx("text-xs font-mono uppercase tracking-wider", theme === "dark" ? "text-slate-500" : "text-gray-500")}>
                            Signer
                          </span>
                        </div>
                        <code className={clsx("block text-xs font-mono break-all", theme === "dark" ? "text-slate-300" : "text-gray-800")}>
                          {verificationResult.documentInfo.signer}
                        </code>
                      </div>

                      <div
                        className={clsx(
                          "backdrop-blur-sm rounded-lg p-4 border",
                          theme === "dark" ? "bg-slate-900/50 border-slate-700" : "bg-gray-50 border-gray-200",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className={clsx("w-3.5 h-3.5", theme === "dark" ? "text-slate-500" : "text-gray-500")} />
                          <span className={clsx("text-xs font-mono uppercase tracking-wider", theme === "dark" ? "text-slate-500" : "text-gray-500")}>
                            Timestamp
                          </span>
                        </div>
                        <span className={clsx("block text-sm font-mono", theme === "dark" ? "text-slate-300" : "text-gray-800")}>
                          {new Date(Number(verificationResult.documentInfo.timestamp) * 1000).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(file || signerAddress || verificationResult) && (
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
          )}
        </div>
      </div>
    </div>
  )
}
