import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HomePage from '@/app/page'

/**
 * T1-01 smoke test — RED until W3-A ships app/page.tsx with "ReLoop" text.
 * Green target: app/page.tsx renders an element matching /ReLoop/i.
 */
describe('HomePage (T1-01 smoke test)', () => {
  it('renders ReLoop tagline', () => {
    render(<HomePage />)
    expect(screen.getByText(/ReLoop/i)).toBeInTheDocument()
  })
})
