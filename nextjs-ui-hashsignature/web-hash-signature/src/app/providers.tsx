'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useState } from 'react'
import { MetaMaskProvider } from '../contexts/MetaMaskContext'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <MetaMaskProvider>
          {children}
        </MetaMaskProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}