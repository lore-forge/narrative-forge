import { Suspense } from 'react'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { IntegrationSection } from '@/components/landing/integration-section'
import { EducationalSection } from '@/components/landing/educational-section'
import { CTASection } from '@/components/landing/cta-section'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1">
        <Suspense fallback={<div className="h-screen bg-gradient-to-br from-narrative-50 to-story-50" />}>
          <HeroSection />
        </Suspense>
        <FeaturesSection />
        <IntegrationSection />
        <EducationalSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}