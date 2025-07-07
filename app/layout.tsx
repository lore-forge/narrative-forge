import type { Metadata } from 'next'
import { Inter, Crimson_Text, Libre_Baskerville } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/components/auth/auth-provider'
import { I18nProvider } from '@/components/i18n-provider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const crimsonText = Crimson_Text({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-crimson'
})

const libreBaskerville = Libre_Baskerville({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-libre'
})

export const metadata: Metadata = {
  title: 'Narrative Forge - AI-Powered Storytelling',
  description: 'Create immersive stories with AI assistance, integrated with the Lore Forge ecosystem for characters and worlds.',
  keywords: ['storytelling', 'AI', 'creative writing', 'education', 'narrative', 'RPG', 'world building'],
  authors: [{ name: 'Lore Forge Team' }],
  creator: 'Lore Forge',
  publisher: 'Lore Forge',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://narrative-forge.lore-forge.com',
    title: 'Narrative Forge - AI-Powered Storytelling',
    description: 'Create immersive stories with AI assistance, integrated with the Lore Forge ecosystem.',
    siteName: 'Narrative Forge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Narrative Forge - AI-Powered Storytelling',
    description: 'Create immersive stories with AI assistance, integrated with the Lore Forge ecosystem.',
    creator: '@loreforge',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${crimsonText.variable} ${libreBaskerville.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <AuthProvider>
              <div className="relative flex min-h-screen flex-col">
                <main className="flex-1">
                  {children}
                </main>
              </div>
              <Toaster />
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}