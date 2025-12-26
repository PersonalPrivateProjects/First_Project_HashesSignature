
"use client"

import { useRef, useState, useEffect } from "react"
import { Hash, Clock, User, AlertCircle, Loader2, RefreshCw, FileText, Database } from "lucide-react"
import { useContract } from "../hooks/useContract"
import { useTheme } from "next-themes"
import clsx from "clsx"

type DocumentHistoryProps = {
  autoLoad?: boolean
}

export function DocumentHistory({ autoLoad = false }: DocumentHistoryProps) {
  const { getDocumentCount, getDocumentHashByIndex, getDocumentInfo } = useContract()
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const { theme } = useTheme()


  const loadDocuments = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const count = await getDocumentCount()
      console.log("Document count:", count)

      const docs: any[] = []
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


 console.log("Auto load is 1", autoLoad)
  useEffect(() => {
    console.log("Auto load is", autoLoad)
    if (!autoLoad) return
    if (buttonRef.current) {
      // pequeño delay para asegurar que el botón esté montado
      const t = setTimeout(() => buttonRef.current?.click(), 500)
      return () => clearTimeout(t)
    }
  }, [autoLoad])


  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <button
          ref={buttonRef}
          onClick={loadDocuments}
          disabled={isLoading}
          className="relative group/btn overflow-hidden"
        >
          <div
            className={clsx(
              "absolute -inset-1 rounded-lg opacity-70 blur transition-all duration-300 group-hover/btn:opacity-100",
              theme === "dark"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                : "bg-gradient-to-r from-indigo-400 to-blue-400",
            )}
          />
          <div
            className={clsx(
              "relative flex items-center gap-3 px-8 py-3.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed",
              theme === "dark"
                ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                : "bg-gradient-to-r from-indigo-400 to-blue-400",
            )}
          >
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
        <div
          className={clsx(
            "rounded-lg border p-5",
            theme === "dark" ? "border-rose-500/30 bg-rose-500/5" : "border-rose-200 bg-rose-50",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                "p-2 rounded-lg border",
                theme === "dark" ? "bg-rose-500/10 border-rose-500/30" : "bg-rose-100 border-rose-200",
              )}
            >
              <AlertCircle className={clsx("w-5 h-5", theme === "dark" ? "text-rose-400" : "text-rose-700")} />
            </div>
            <span className={clsx("text-sm font-mono", theme === "dark" ? "text-rose-400" : "text-rose-700")}>
              {error}
            </span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-20">
          <div className="relative inline-block mb-6">
            <div
              className={clsx(
                "absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse",
                theme === "dark" ? "bg-blue-500" : "bg-indigo-300",
              )}
            />
            <div
              className={clsx(
                "relative p-6 rounded-full border",
                theme === "dark" ? "bg-slate-900 border-blue-500/30" : "bg-white border-indigo-300",
              )}
            >
              <Loader2 className={clsx("w-12 h-12 animate-spin", theme === "dark" ? "text-blue-400" : "text-indigo-600")} />
            </div>
          </div>
          <p className={clsx("text-sm font-mono", theme === "dark" ? "text-slate-400" : "text-gray-600")}>
            Fetching blockchain records...
          </p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-20">
          <div className="relative inline-block mb-6">
            <div
              className={clsx(
                "absolute inset-0 rounded-full blur-2xl opacity-10",
                theme === "dark" ? "bg-slate-500" : "bg-gray-300",
              )}
            />
            <div
              className={clsx(
                "relative p-6 rounded-full border",
                theme === "dark" ? "bg-slate-900 border-slate-700" : "bg-white border-gray-300",
              )}
            >
              <Database className={clsx("w-12 h-12", theme === "dark" ? "text-slate-500" : "text-gray-600")} />
            </div>
          </div>
          <h3 className={clsx("text-lg font-mono font-bold mb-2", theme === "dark" ? "text-white" : "text-gray-900")}>
            NO DOCUMENTS
          </h3>
          <p className={clsx("text-sm max-w-md mx-auto", theme === "dark" ? "text-slate-400" : "text-gray-600")}>
            The registry is empty
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header del registro */}
          <div className="flex items-center justify-between px-1">
            <h4 className={clsx("text-lg font-mono font-bold uppercase tracking-wider", theme === "dark" ? "text-white" : "text-gray-900")}>
              Registry
            </h4>
            <div
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-full border",
                theme === "dark" ? "bg-slate-900 border-blue-500/30" : "bg-indigo-50 border-indigo-200",
              )}
            >
              <FileText className={clsx("w-4 h-4", theme === "dark" ? "text-blue-400" : "text-indigo-700")} />
              <span className={clsx("text-sm font-mono font-bold", theme === "dark" ? "text-blue-400" : "text-indigo-700")}>
                {documents.length}
              </span>
            </div>
          </div>

          {/* Lista de documentos */}
          {documents.map((doc, index) => (
            <div key={index} className="relative group">
              <div
                className={clsx(
                  "absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-20 blur transition-all duration-300",
                  theme === "dark" ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-gradient-to-r from-indigo-300 to-blue-300",
                )}
              />

              <div
                className={clsx(
                  "relative rounded-xl overflow-hidden border transition-all",
                  theme === "dark" ? "bg-slate-950 border-slate-800 hover:border-slate-700" : "bg-white border-gray-200 hover:border-gray-300",
                )}
              >
                {/* Header del documento */}
                <div
                  className={clsx(
                    "flex items-center justify-between px-6 py-4 border-b",
                    theme === "dark"
                      ? "border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900"
                      : "border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className={clsx(
                          "absolute inset-0 rounded-md blur-md opacity-50",
                          theme === "dark" ? "bg-blue-500" : "bg-indigo-300",
                        )}
                      />
                      <div
                        className={clsx(
                          "relative p-2 border rounded-md",
                          theme === "dark" ? "bg-slate-900 border-blue-500/30" : "bg-white border-indigo-300",
                        )}
                      >
                        <FileText className={clsx("w-5 h-5", theme === "dark" ? "text-blue-400" : "text-indigo-700")} />
                      </div>
                    </div>
                    <div>
                      <h5 className={clsx("font-mono font-bold", theme === "dark" ? "text-white" : "text-gray-900")}>
                        DOC #{index + 1}
                      </h5>
                      <p className={clsx("text-xs font-mono", theme === "dark" ? "text-slate-500" : "text-gray-500")}>
                        Blockchain Verified
                      </p>
                    </div>
                  </div>
                  <div
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1 rounded-full border",
                      theme === "dark" ? "bg-slate-900 border-emerald-500/30" : "bg-emerald-50 border-emerald-200",
                    )}
                  >
                    <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", theme === "dark" ? "bg-emerald-400" : "bg-emerald-600")} />
                    <span className={clsx("text-xs font-mono", theme === "dark" ? "text-emerald-400" : "text-emerald-700")}>
                      VERIFIED
                    </span>
                  </div>
                </div>

                {/* Contenido del documento */}
                <div className="p-6 space-y-4">
                  {/* Hash */}
                  <div
                    className={clsx(
                      "rounded-lg p-4 border",
                      theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-gray-50 border-gray-200",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className={clsx("w-3.5 h-3.5", theme === "dark" ? "text-slate-500" : "text-gray-500")} />
                      <span className={clsx("text-xs font-mono uppercase tracking-wider", theme === "dark" ? "text-slate-500" : "text-gray-500")}>
                        Hash
                      </span>
                    </div>
                    <code className={clsx("block text-xs font-mono break-all leading-relaxed", theme === "dark" ? "text-slate-300" : "text-gray-800")}>
                      {doc.hash}
                    </code>
                  </div>

                  {/* Grid de info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div
                      className={clsx(
                        "rounded-lg p-4 border",
                        theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-gray-50 border-gray-200",
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <User className={clsx("w-3.5 h-3.5", theme === "dark" ? "text-slate-500" : "text-gray-500")} />
                        <span className={clsx("text-xs font-mono uppercase tracking-wider", theme === "dark" ? "text-slate-500" : "text-gray-500")}>
                          Signer
                        </span>
                      </div>
                      <code className={clsx("block text-xs font-mono break-all", theme === "dark" ? "text-slate-300" : "text-gray-800")}>
                        {doc.signer}
                      </code>
                    </div>

                    <div
                      className={clsx(
                        "rounded-lg p-4 border",
                        theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-gray-50 border-gray-200",
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className={clsx("w-3.5 h-3.5", theme === "dark" ? "text-slate-500" : "text-gray-500")} />
                        <span className={clsx("text-xs font-mono uppercase tracking-wider", theme === "dark" ? "text-slate-500" : "text-gray-500")}>
                          Time
                        </span>
                      </div>
                      <span className={clsx("block text-sm font-mono", theme === "dark" ? "text-slate-300" : "text-gray-800")}>
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
