'use client'

import { useState, useCallback } from 'react'
import { Upload, File, Hash, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { HashUtils } from '../utils/hash'

interface FileUploaderProps {
  onFileHash?: (hash: string) => void
}

export function FileUploader({ onFileHash }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [hash, setHash] = useState<string>('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setError(error.message || 'Failed to calculate file hash')
    } finally {
      setIsCalculating(false)
    }
  }, [onFileHash])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      const input = document.getElementById('file-input') as HTMLInputElement
      if (input) {
        input.files = event.dataTransfer.files
        handleFileChange({ target: { files: event.dataTransfer.files } } as any)
      }
    }
  }, [handleFileChange])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-700/50">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="space-y-6"
        >
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Upload a Document
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Drag and drop a file here, or click to select
            </p>
            
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept="*/*"
            />
            
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
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3 mb-3">
            <File className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              {file.name}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Size: {(file.size / 1024).toFixed(2)} KB
          </div>
        </div>
      )}

      {/* Hash Display */}
      {isCalculating && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin text-yellow-600 dark:text-yellow-400" />
            <span className="text-yellow-800 dark:text-yellow-200 font-medium">
              Calculating file hash...
            </span>
          </div>
        </div>
      )}

      {hash && !isCalculating && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-800 dark:text-green-200">
              File Hash Generated Successfully
            </span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded p-3 border border-green-200 dark:border-green-700">
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">SHA-256 Hash:</span>
            </div>
            <code className="text-sm font-mono text-gray-900 dark:text-white break-all">
              {hash}
            </code>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-red-800 dark:text-red-200 font-medium">
              {error}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}