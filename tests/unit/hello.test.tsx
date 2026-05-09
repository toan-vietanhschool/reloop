import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HeroSection } from '@/components/shared/HeroSection'

/**
 * T1-01 smoke test — verifies landing hero renders with brand language.
 * After T1-09 the marketing landing moved into app/(marketing)/page.tsx; route
 * groups in the import path are awkward, so we test the HeroSection directly.
 */
describe('HeroSection (T1-01 smoke test)', () => {
  it('renders the Shazam cho rác tagline', () => {
    render(<HeroSection />)
    expect(screen.getByText(/Shazam cho rác/i)).toBeInTheDocument()
  })

  it('renders the primary Bắt đầu Scan CTA', () => {
    render(<HeroSection />)
    expect(screen.getByText(/Bắt đầu Scan/i)).toBeInTheDocument()
  })
})
