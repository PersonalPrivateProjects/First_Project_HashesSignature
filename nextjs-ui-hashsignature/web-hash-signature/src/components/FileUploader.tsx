"use client"

import { useState, useCallback } from "react"
import { Upload, File, Hash, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { HashUtils } from "../utils/hash"
import { useTheme } from "next-themes"
import clsx from "clsx"

interface FileUploaderProps {
  onFileHash?: (hash: string) => void
}

export function FileUploader({ onFileHash }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [hash, setHash] = useState<string>("")
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0]
      if (!selectedFile) return

      setFile(selectedFile)
      setError(null)
      setIsCalculating(true)

      try {
        const fileHash = await HashUtils.calculateFileHash(selectedFile)
        setHash(fileHash)
        onFileHash?.(fileHash)
      } catch (error: any) {
        setError(error.message || "Failed to calculate file hash")
      } finally {
        setIsCalculating(false)
      }
    },
    [onFileHash]
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const droppedFile = event.dataTransfer.files[0]
      if (droppedFile) {
        const input = document.getElementById("file-input") as HTMLInputElement
        if (input) {
          input.files = event.dataTransfer.files
          handleFileChange({ target: { files: event.dataTransfer.files } } as any)
        }
      }
    },
    [handleFileChange]
  )

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        className={clsx(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
          theme === "dark"
            ? "border-gray-600 hover:border-blue-500 bg-gray-700/50"
            : "border-gray-300 hover:border-blue-400 bg-gray-50"
        )}
      >
        <div onDrop={handleDrop} onDragOver={handleDragOver} className="space-y-6">
          <div
            className={clsx(
              "w-20 h-20 rounded-full flex items-center justify-center mx-auto",
              theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"
            )}
          >
            <Upload className={clsx("w-10 h-10", theme === "dark" ? "text-blue-400" : "text-blue-600")} />
          </div>

          <div>
            <h3 className={clsx("text-xl font-semibold mb-2", theme === "dark" ? "text-white" : "text-gray-900")}>
              Upload a Document
            </h3>
            <p className={clsx("mb-6", theme === "dark" ? "text-gray-300" : "text-gray-600")}>
              Drag and drop a file here, or click to select
            </p>

            <input id="file-input" type="file" onChange={handleFileChange} className="hidden" accept="*/*" />

            <label
              htmlFor="file-input"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors font-medium"
            >
              <File className="w-5 h-5" />
              <span>Choose File</span>
            </label>
          </div>
        </div>
      </div>

      {/* File Info */}
      {file && (
        <div
          className={clsx(
            "rounded-lg p-4 border",
            theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"
          )}
        >
          <div className="flex items-center space-x-3 mb-3">
            <File className={clsx("w-5 h-5", theme === "dark" ? "text-blue-400" : "text-blue-600")} />
            <span className="font-medium">{file.name}</span>
          </div>
          <div className={clsx("text-sm", theme === "dark" ? "text-gray-300" : "text-gray-600")}>
            Size: {(file.size / 1024).toFixed(2)} KB
          </div>
        </div>
      )}

      {/* Hash Display */}
      {isCalculating && (
        <div
          className={clsx(
            "rounded-lg p-4 border flex items-center space-x-3",
            theme === "dark"
              ? "bg-yellow-900/20 border-yellow-800 text-yellow-200"
              : "bg-yellow-50 border-yellow-200 text-yellow-800"
          )}
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium">Calculating file hash...</span>
        </div>
      )}

      {hash && !isCalculating && (
        <div
          className={clsx(
            "rounded-lg p-4 border",
            theme === "dark"
              ? "bg-green-900/20 border-green-800 text-green-200"
              : "bg-green-50 border-green-200 text-green-800"
          )}
        >
          <div className="flex items-center space-x-3 mb-3">
            <CheckCircle className={clsx("w-5 h-5", theme === "dark" ? "text-green-400" : "text-green-600")} />
            <span className="font-medium">File Hash Generated Successfully</span>
          </div>
          <div
            className={clsx(
              "rounded p-3 border",
              theme === "dark" ? "bg-gray-800 border-green-700 text-white" : "bg-white border-green-200 text-gray-900"
            )}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Hash className={clsx("w-4 h-4", theme === "dark" ? "text-green-400" : "text-green-600")} />
              <span className="text-sm font-medium">SHA-256 Hash:</span>
            </div>
            <code className="text-sm font-mono break-all">{hash}</code>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          className={clsx(
            "rounded-lg p-4 border flex items-center space-x-3",
            theme === "dark"
              ? "bg-red-900/20 border-red-800 text-red-200"
              : "bg-red-50 border-red-200 text-red-800"
          )}
        >
          <AlertCircle className={clsx("w-5 h-5", theme === "dark" ? "text-red-400" : "text-red-600")} />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  )
}
