'use client'

import { useState, useEffect } from 'react'
import { History, Hash, Clock, User, AlertCircle, Loader2, RefreshCw, FileText } from 'lucide-react'
import { useContract } from '../hooks/useContract'

export function DocumentHistory() {
  const { getDocumentCount, getDocumentHashByIndex, getDocumentInfo } = useContract()
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDocuments = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const count = await getDocumentCount()
      const docs = []

      for (let i = 0; i < count; i++) {
        const hash = await getDocumentHashByIndex(i)
        const info = await getDocumentInfo(hash)
        docs.push({
          ...info,
          hash
        })
      }

      setDocuments(docs)
    } catch (error: any) {
      setError(error.message || 'Failed to load documents')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  return (
    <div className="space-y-6">

      {/* Load Button */}
      <div className="flex justify-center">
        <button
          onClick={loadDocuments}
          disabled={isLoading}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </>
          )}
        </button>
      </div>

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

      {/* Documents List */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Documents Found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            No documents have been stored in the registry yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Documents ({documents.length})
            </h4>
          </div>
          
          {documents.map((doc, index) => (
            <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white">
                      Document #{index + 1}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Stored on blockchain
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-800 dark:text-green-200">
                    Verified
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hash */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Hash className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Document Hash
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
                    <code className="text-xs font-mono text-gray-900 dark:text-white break-all">
                      {doc.hash}
                    </code>
                  </div>
                </div>

                {/* Signer */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Signer Address
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
                    <code className="text-xs font-mono text-gray-900 dark:text-white break-all">
                      {doc.signer}
                    </code>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Timestamp
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(Number(doc.timestamp) * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}