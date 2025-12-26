
"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import {
  Hash,
  Clock,
  User,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileText,
  Database,
  Download, // ⬅️ para exportar CSV
} from "lucide-react"
import { useContract } from "../hooks/useContract"
import { useTheme } from "next-themes"
import clsx from "clsx"

type DocumentHistoryProps = {
  autoLoad?: boolean
}

type DocRow = {
  hash: string
  signer: string
  timestamp: number | string | bigint
  signature?: string
  documentHash?: string
}

export function DocumentHistory({ autoLoad = false }: DocumentHistoryProps) {
  const { getDocumentCount, getDocumentHashByIndex, getDocumentInfo } = useContract()

  const [documents, setDocuments] = useState<DocRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const { theme } = useTheme()

  // 🔎 Filtros
  const [signerFilter, setSignerFilter] = useState("")
  const [yearFilter, setYearFilter] = useState<string>("")
  const [monthFilter, setMonthFilter] = useState<string>("")
  const [dayFilter, setDayFilter] = useState<string>("")

  // 📄 Paginación
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // 🗂️ Util: formatear fecha YYYY-MM-DD (local)
  const formatYMD = (ts: number | string | bigint) => {
    const d = new Date(Number(ts) * 1000)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const da = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${da}`
  }

  const loadDocuments = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const count: number = Number(await getDocumentCount())
      const docs: DocRow[] = []
      for (let i = 0; i < count; i++) {
        const hash = await getDocumentHashByIndex(i)
        const info = await getDocumentInfo(hash)
        docs.push({
          hash,
          signer: info.signer,
          timestamp: Number(info.timestamp),
          signature: info.signature,
          documentHash: info.documentHash,
        })
      }
      setDocuments(docs)
      // Reset paginación al refrescar
      setPage(1)
    } catch (err: any) {
      setError(err?.message || "Failed to load documents")
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-load por botón (mantengo tu comportamiento)
  useEffect(() => {
    if (!autoLoad) return
    if (buttonRef.current) {
      const t = setTimeout(() => buttonRef.current?.click(), 500)
      return () => clearTimeout(t)
    }
  }, [autoLoad])

  // 🔁 Recalcular filtrado
  const filteredDocs = useMemo(() => {
    const s = signerFilter.trim().toLowerCase()
    const y = yearFilter.trim()
    const m = monthFilter.trim()
    const d = dayFilter.trim()

    return documents.filter((doc) => {
      // Filtrado por signer (contains, case-insensitive)
      const signerMatch = s
        ? String(doc.signer).toLowerCase().includes(s)
        : true

      // Filtrado por fecha (Y/M/D opcionales, local time)
      const date = new Date(Number(doc.timestamp) * 1000)
      const matchesYear = y ? date.getFullYear() === Number(y) : true
      const matchesMonth = m ? (date.getMonth() + 1) === Number(m) : true
      const matchesDay = d ? date.getDate() === Number(d) : true

      return signerMatch && matchesYear && matchesMonth && matchesDay
    })
  }, [documents, signerFilter, yearFilter, monthFilter, dayFilter])

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / pageSize))

  // Página actual (slice)
  const pageDocs = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredDocs.slice(start, start + pageSize)
  }, [filteredDocs, page, pageSize])

  // ✅ Exportar CSV (solo columnas de la tabla: Hash, Signer, Time)
  //   Exporta TODOS los resultados filtrados (ignora paginación)
  const exportCSV = () => {
    if (filteredDocs.length === 0) {
      alert("No data to export")
      return
    }
    const header = ["Hash", "Signer", "Time"]
    const rows = filteredDocs.map((doc) => [
      doc.hash,
      doc.signer,
      formatYMD(doc.timestamp),
    ])

    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `document-history.csv`
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Navegación paginación
  const goPrev = () => setPage((p) => Math.max(1, p - 1))
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1))

  // Reset filtros
  const resetFilters = () => {
    setSignerFilter("")
    setYearFilter("")
    setMonthFilter("")
    setDayFilter("")
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Acción: cargar/refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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
                "relative flex items-center gap-3 px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed",
                theme === "dark"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                  : "bg-gradient-to-r from-indigo-400 to-blue-400",
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span className="text-sm font-mono font-semibold text-white uppercase tracking-wider">
                    Loading...
                  </span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 text-white" />
                  <span className="text-sm font-mono font-semibold text-white uppercase tracking-wider">
                    Refresh
                  </span>
                </>
              )}
            </div>
          </button>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            disabled={isLoading || filteredDocs.length === 0}
            className={clsx(
              "flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors",
              theme === "dark"
                ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            title="Export filtered table to CSV"
          >
            <Download className={clsx("w-4 h-4", theme === "dark" ? "text-slate-300" : "text-gray-700")} />
            <span className="text-xs font-mono">Export CSV</span>
          </button>
        </div>

        {/* Contador total (filtrado) */}
        <div
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-full border",
            theme === "dark" ? "bg-slate-900 border-blue-500/30" : "bg-indigo-50 border-indigo-200",
          )}
        >
          <FileText className={clsx("w-4 h-4", theme === "dark" ? "text-blue-400" : "text-indigo-700")} />
          <span className={clsx("text-sm font-mono font-bold", theme === "dark" ? "text-blue-400" : "text-indigo-700")}>
            {filteredDocs.length}
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div
        className={clsx(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 rounded-lg border p-4",
          theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-white border-gray-200",
        )}
      >
        <div className="flex flex-col">
          <label
            className={clsx("text-xs font-mono mb-1", theme === "dark" ? "text-slate-400" : "text-gray-600")}
          >
            Signer (contains)
          </label>
          <input
            type="text"
            placeholder="0xabc..."
            value={signerFilter}
            onChange={(e) => { setSignerFilter(e.target.value); setPage(1) }}
            className={clsx(
              "px-3 py-2 rounded border text-sm font-mono",
              theme === "dark"
                ? "bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500"
                : "bg-white border-gray-300 text-gray-800 placeholder:text-gray-400",
            )}
          />
        </div>

        <div className="flex flex-col">
          <label className={clsx("text-xs font-mono mb-1", theme === "dark" ? "text-slate-400" : "text-gray-600")}>
            Year (YYYY)
          </label>
          <input
            type="number"
            min={1970}
            max={9999}
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setPage(1) }}
            className={clsx(
              "px-3 py-2 rounded border text-sm font-mono",
              theme === "dark" ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-gray-300 text-gray-800",
            )}
          />
        </div>

        <div className="flex flex-col">
          <label className={clsx("text-xs font-mono mb-1", theme === "dark" ? "text-slate-400" : "text-gray-600")}>
            Month (MM)
          </label>
          <select
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value); setPage(1) }}
            className={clsx(
              "px-3 py-2 rounded border text-sm font-mono",
              theme === "dark" ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-gray-300 text-gray-800",
            )}
          >
            <option value="">Any</option>
            {[...Array(12)].map((_, i) => {
              const v = String(i + 1).padStart(2, "0")
              return <option key={v} value={String(i + 1)}>{v}</option>
            })}
          </select>
        </div>

        <div className="flex flex-col">
          <label className={clsx("text-xs font-mono mb-1", theme === "dark" ? "text-slate-400" : "text-gray-600")}>
            Day (DD)
          </label>
          <input
            type="number"
            min={1}
            max={31}
            value={dayFilter}
            onChange={(e) => { setDayFilter(e.target.value); setPage(1) }}
            className={clsx(
              "px-3 py-2 rounded border text-sm font-mono",
              theme === "dark" ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-gray-300 text-gray-800",
            )}
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={resetFilters}
            className={clsx(
              "px-4 py-2 rounded border text-sm font-mono transition-colors",
              theme === "dark"
                ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50",
            )}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Tabla con scroll */}
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
        <div className="text-center py-16">
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
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-12">
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
            The registry is empty or no results match your filters
          </p>
        </div>
      ) : (
        <>
          <div
            className={clsx(
              "rounded-lg border",
              theme === "dark" ? "border-slate-800 bg-slate-950" : "border-gray-200 bg-white",
            )}
          >
            <div className="max-h-[520px] overflow-y-auto overflow-x-auto rounded-lg">
              <table className="min-w-full border-collapse">
                <thead
                  className={clsx(
                    "sticky top-0 z-10",
                    theme === "dark"
                      ? "bg-slate-900 border-b border-slate-700"
                      : "bg-gray-50 border-b border-gray-200",
                  )}
                >
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider">
                      #
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Hash className={clsx("w-3.5 h-3.5", theme === "dark" ? "text-slate-400" : "text-gray-500")} />
                        Hash
                      </div>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <User className={clsx("w-3.5 h-3.5", theme === "dark" ? "text-slate-400" : "text-gray-500")} />
                        Signer
                      </div>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Clock className={clsx("w-3.5 h-3.5", theme === "dark" ? "text-slate-400" : "text-gray-500")} />
                        Time (YYYY-MM-DD)
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageDocs.map((doc, idx) => (
                    <tr
                      key={`${doc.hash}-${idx}`}
                      className={clsx(
                        theme === "dark" ? "hover:bg-slate-900/60" : "hover:bg-gray-50",
                        "transition-colors",
                      )}
                    >
                      <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-slate-500">
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <code className={clsx("block text-xs font-mono break-all", theme === "dark" ? "text-slate-300" : "text-gray-800")}>
                          {doc.hash}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <code className={clsx("block text-xs font-mono break-all", theme === "dark" ? "text-slate-300" : "text-gray-800")}>
                          {doc.signer}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx("text-xs font-mono", theme === "dark" ? "text-slate-300" : "text-gray-800")}>
                          {formatYMD(doc.timestamp)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={clsx("text-xs font-mono", theme === "dark" ? "text-slate-400" : "text-gray-600")}>
                Page
              </span>
              <span className={clsx("px-2 py-1 rounded border text-xs font-mono",
                theme === "dark" ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-gray-300 text-gray-800"
              )}>
                {page} / {totalPages}
              </span>

              <button
                onClick={goPrev}
                disabled={page <= 1}
                className={clsx(
                  "px-3 py-1 rounded border text-xs font-mono transition-colors",
                  theme === "dark"
                    ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                Prev
              </button>
              <button
                onClick={goNext}
                disabled={page >= totalPages}
                className={clsx(
                  "px-3 py-1 rounded border text-xs font-mono transition-colors",
                  theme === "dark"
                    ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                Next
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className={clsx("text-xs font-mono", theme === "dark" ? "text-slate-400" : "text-gray-600")}>
                Rows per page
              </span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                className={clsx(
                  "px-2 py-1 rounded border text-xs font-mono",
                  theme === "dark" ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-gray-300 text-gray-800",
                )}
              >
                {[10, 25, 50, 100].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
