'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        className: 'text-sm',
        duration: 3000,
      }}
      offset={80}
    />
  )
}
