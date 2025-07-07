'use client'

import { createContext, useContext, useState } from 'react'

interface I18nContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState('en')

  // Mock translation function
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'welcome': 'Welcome',
      'create_story': 'Create Story',
      'my_stories': 'My Stories',
      // Add more translations as needed
    }
    return translations[key] || key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}