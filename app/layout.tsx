import type { Metadata } from 'next'
import { Poppins, Roboto,Inter,Bebas_Neue } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { RegistrationProvider } from '@/contexts/RegistrationContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

// Load Poppins for general text
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

// Load Roboto for monospace/code
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
})

// Load Inter (secondary sans option)
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
})
// Load Bebas Neue (display headings, bold titles, etc.)
const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400', // Bebas Neue only has one weight
  variable: '--font-bebas',
})
export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${roboto.variable} ${inter.variable} ${bebasNeue.variable}`}>
      <body className={`font-sans ${poppins.variable}`}>
        <AuthProvider>
          <RegistrationProvider>
            {children}
          </RegistrationProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
