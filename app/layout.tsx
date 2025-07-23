import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Simulador de Financiamento',
  description: 'Desenvolvido por Gabriel Mello',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
