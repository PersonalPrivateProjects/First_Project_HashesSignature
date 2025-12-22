"use client"

import { useRef, useState, useEffect } from "react"
import { Hash, Clock, User, AlertCircle, Loader2, RefreshCw, FileText, Database } from "lucide-react"
import { useContract } from "../hooks/useContract"

export function DocumentHistory() {
  const { getDocumentCount, getDocumentHashByIndex, getDocumentInfo } = useContract()
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const loadDocuments = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const count = await getDocumentCount()
      console.log("Document count:", count)

      const docs = []

      for (let i = 0; i < count; i++) {
        const hash = await getDocumentHashByIndex(i)
        const info = await getDocumentInfo(hash)
        docs.push({
          ...info,
          hash,
        })
      }

      setDocuments(docs)
    } catch (error: any) {
      setError(error.message || "Failed to load documents")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (buttonRef.current) {
      console.log("Auto-loading documentos validados al montar el componente")
      setTimeout(() => {
        buttonRef.current?.click()
      }, 500)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <button
          ref={buttonRef}
          onClick={loadDocuments}
          disabled={isLoading}
          className="relative group/btn overflow-hidden"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg opacity-70 group-hover/btn:opacity-100 blur transition-all duration-300"></div>
          <div className="relative flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span className="text-sm font-mono font-semibold text-white uppercase tracking-wider">Loading...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 text-white" />
                <span className="text-sm font-mono font-semibold text-white uppercase tracking-wider">Refresh</span>
              </>
            )}
          </div>
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-sm font-mono text-rose-400">{error}</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-20">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative p-6 bg-slate-900 border border-blue-500/30 rounded-full">
              <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
            </div>
          </div>
          <p className="text-sm font-mono text-slate-400">Fetching blockchain records...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-20">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-slate-500 rounded-full blur-2xl opacity-10"></div>
            <div className="relative p-6 bg-slate-900 border border-slate-700 rounded-full">
              <Database className="w-12 h-12 text-slate-500" />
            </div>
          </div>
          <h3 className="text-lg font-mono font-bold text-white mb-2">NO DOCUMENTS</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">The registry is empty</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header del registro */}
          <div className="flex items-center justify-between px-1">
            <h4 className="text-lg font-mono font-bold text-white uppercase tracking-wider">Registry</h4>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-blue-500/30 rounded-full">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-mono font-bold text-blue-400">{documents.length}</span>
            </div>
          </div>

          {/* Lista de documentos con diseño tipo blockchain */}
          {documents.map((doc, index) => (
            <div key={index} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition-all duration-300"></div>

              <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all">
                {/* Header del documento */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500 rounded-md blur-md opacity-50"></div>
                      <div className="relative p-2 bg-slate-900 border border-blue-500/30 rounded-md">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-mono font-bold text-white">DOC #{index + 1}</h5>
                      <p className="text-xs text-slate-500 font-mono">Blockchain Verified</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-emerald-500/30 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-mono text-emerald-400">VERIFIED</span>
                  </div>
                </div>

                {/* Contenido del documento */}
                <div className="p-6 space-y-4">
                  {/* Hash */}
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Hash</span>
                    </div>
                    <code className="block text-xs font-mono text-slate-300 break-all leading-relaxed">{doc.hash}</code>
                  </div>

                  {/* Grid de info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Signer</span>
                      </div>
                      <code className="block text-xs font-mono text-slate-300 break-all">{doc.signer}</code>
                    </div>

                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Time</span>
                      </div>
                      <span className="block text-sm font-mono text-slate-300">
                        {new Date(Number(doc.timestamp) * 1000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
