import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-narrative-500 to-story-500 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Start Your Storytelling Journey</h2>
        <p className="text-lg mb-8 opacity-90">
          Create your first AI-powered story today
        </p>
        <Link href="/stories/create">
          <Button size="lg" variant="secondary">
            Create Your First Story
          </Button>
        </Link>
      </div>
    </section>
  )
}