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
    // The tagline is split across text nodes by a decorative
    // underline span, so assert each half rather than the joined
    // string (which getByText with a regex cannot find).
    expect(screen.getByText(/Shazam/i)).toBeInTheDocument()
    expect(screen.getByText(/cho rác\./i)).toBeInTheDocument()
  })

  it('renders the primary Bắt đầu Scan CTA', () => {
    render(<HeroSection />)
    expect(screen.getByText(/Bắt đầu Scan/i)).toBeInTheDocument()
  })
})
