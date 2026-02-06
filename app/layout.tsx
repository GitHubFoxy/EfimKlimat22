import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server'
import { BugReportBanner } from '@/components/BugReportBanner'
import { Description, Icon, Title } from '@/lib/consts'
import { AppProviders } from './providers'

const inter = Inter({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: Title,
  description: Description,
  icons: {
    icon: Icon,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html
        lang='ru'
        className={`${inter.variable} font-inter `}
        suppressHydrationWarning
      >
        <head>
          {process.env.NODE_ENV === 'development' && (
            <Script
              src='//unpkg.com/react-grab/dist/index.global.js'
              crossOrigin='anonymous'
              strategy='beforeInteractive'
            />
          )}
        </head>
        <body className={`antialiased`} suppressHydrationWarning>
          <BugReportBanner />
          <AppProviders>{children}</AppProviders>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  )
}
