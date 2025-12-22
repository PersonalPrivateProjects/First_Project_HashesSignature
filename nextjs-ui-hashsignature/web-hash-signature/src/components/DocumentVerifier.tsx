"use client"

import type React from "react"

import { useState } from "react"
import { CheckCircle, AlertCircle, Loader2, Upload, Hash, Shield, User, Clock } from "lucide-react"
import { useContract } from "../hooks/useContract"
import { HashUtils } from "../utils/hash"

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

      // Better error messages
      if (error.message.includes("could not decode result data")) {
        errorMessage = "Contract error: Please make sure the contract is deployed and Anvil is running."
      } else if (error.message.includes("network")) {
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
      {/* Efecto de fondo con gradiente animado */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 rounded-2xl opacity-20 group-hover:opacity-30 blur-xl transition-all duration-500"></div>

      <div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Header con diseño minimalista */}
        <div className="relative border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 rounded-lg blur-md opacity-50"></div>
                <div className="relative p-3 bg-slate-900 border border-cyan-500/30 rounded-lg">
                  <Shield className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">VERIFY</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Blockchain Authentication</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-cyan-500/30 rounded-full">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-mono text-cyan-400">LIVE</span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Input de archivo con diseño tech */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              Document Upload
            </label>
            <div className="relative group/input">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg opacity-0 group-hover/input:opacity-20 blur transition-all duration-300"></div>
              <div className="relative bg-slate-900 border border-slate-700 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 bg-transparent text-slate-300 text-sm focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-mono file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 file:transition-all cursor-pointer"
                  accept="*/*"
                />
              </div>
            </div>
            {file && (
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg">
                <div className="p-1.5 bg-cyan-500/10 rounded">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{file.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            )}
          </div>

          {/* Input de dirección con diseño tech */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              Signer Address
            </label>
            <div className="relative group/input">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg opacity-0 group-hover/input:opacity-20 blur transition-all duration-300"></div>
              <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-lg hover:border-cyan-500/50 transition-all">
                <div className="pl-4 pr-3">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={signerAddress}
                  onChange={(e) => setSignerAddress(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 px-0 py-3 pr-4 bg-transparent text-slate-300 placeholder:text-slate-600 text-sm font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Botón de verificación con efecto neón */}
          <button
            onClick={handleVerify}
            disabled={!file || !signerAddress.trim() || isVerifying}
            className="w-full relative group/btn overflow-hidden"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg opacity-70 group-hover/btn:opacity-100 blur transition-all duration-300"></div>
            <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
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

          {/* Resultado de verificación con diseño moderno */}
          {verificationResult && (
            <div
              className={`relative overflow-hidden rounded-lg border ${
                verificationResult.isValid
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-rose-500/30 bg-rose-500/5"
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className={`p-3 rounded-lg ${
                      verificationResult.isValid
                        ? "bg-emerald-500/10 border border-emerald-500/30"
                        : "bg-rose-500/10 border border-rose-500/30"
                    }`}
                  >
                    {verificationResult.isValid ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-rose-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-bold mb-1 font-mono ${
                        verificationResult.isValid ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {verificationResult.isValid ? "✓ VERIFIED" : "✗ FAILED"}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {verificationResult.isValid
                        ? "Document authenticity confirmed on-chain"
                        : verificationResult.error}
                    </p>
                  </div>
                </div>

                {verificationResult.documentInfo && (
                  <div className="space-y-3">
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Hash</span>
                      </div>
                      <code className="block text-xs font-mono text-slate-300 break-all leading-relaxed">
                        {verificationResult.documentInfo.hash}
                      </code>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Signer</span>
                        </div>
                        <code className="block text-xs font-mono text-slate-300 break-all">
                          {verificationResult.documentInfo.signer}
                        </code>
                      </div>

                      <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Timestamp</span>
                        </div>
                        <span className="block text-sm font-mono text-slate-300">
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
              className="w-full px-4 py-3 border border-slate-700 text-slate-400 rounded-lg hover:bg-slate-900 hover:border-slate-600 hover:text-slate-300 transition-all text-sm font-mono"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
