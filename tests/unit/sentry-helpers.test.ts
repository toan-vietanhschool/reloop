import { describe, expect, it } from "vitest"
import type { ErrorEvent, EventHint } from "@sentry/nextjs"

import { dropExpectedErrors, scrubUserPII } from "@/lib/sentry-helpers"

function makeEvent(overrides: Partial<ErrorEvent> = {}): ErrorEvent {
  return { type: undefined, ...overrides } as ErrorEvent
}

function makeHint(message: string): EventHint {
  return { originalException: new Error(message) } as EventHint
}

describe("scrubUserPII", () => {
  it("keeps only the id field on event.user", () => {
    const event = makeEvent({
      user: {
        id: "user_123",
        email: "leak@example.com",
        ip_address: "203.0.113.1",
        username: "leaker",
      },
    })

    const out = scrubUserPII(event)

    expect(out.user).toEqual({ id: "user_123" })
  })

  it("strips an unknown custom field added by setUser()", () => {
    const event = makeEvent({
      user: {
        id: "user_123",
        // Simulate a future custom field added via Sentry.setUser().
        segment: "vip",
      },
    })

    const out = scrubUserPII(event)

    expect(out.user).not.toHaveProperty("segment")
    expect(out.user).toEqual({ id: "user_123" })
  })

  it("leaves the event unchanged when there is no user", () => {
    const event = makeEvent({})

    const out = scrubUserPII(event)

    expect(out.user).toBeUndefined()
  })
})

describe("dropExpectedErrors", () => {
  it("drops rate-limit errors", () => {
    expect(dropExpectedErrors(makeEvent(), makeHint("rate_limited"))).toBeNull()
    expect(dropExpectedErrors(makeEvent(), makeHint("Rate limit exceeded"))).toBeNull()
  })

  it("drops unauthorized / forbidden auth noise", () => {
    expect(dropExpectedErrors(makeEvent(), makeHint("UNAUTHORIZED"))).toBeNull()
    expect(dropExpectedErrors(makeEvent(), makeHint("Forbidden by policy"))).toBeNull()
  })

  it("passes real exceptions through", () => {
    const event = makeEvent()
    expect(dropExpectedErrors(event, makeHint("TypeError: cannot read"))).toBe(event)
  })

  it("passes events through when there is no originalException", () => {
    const event = makeEvent()
    expect(dropExpectedErrors(event, {} as EventHint)).toBe(event)
  })
})
