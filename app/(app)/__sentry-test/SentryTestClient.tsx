"use client"

import { useState } from "react"

interface ButtonState {
  status: "idle" | "thrown"
  message: string
}

/**
 * Client component for the Sentry test page. Throws synchronously on click so
 * the browser's unhandled error handler catches it and forwards to Sentry.
 */
export function SentryTestClient(): React.ReactElement {
  const [state, setState] = useState<ButtonState>({
    status: "idle",
    message: "",
  })

  function triggerClientError(): void {
    setState({ status: "thrown", message: "Đã ném lỗi client-side." })
    // Throw on the next tick so React's render does not swallow it.
    setTimeout(() => {
      throw new Error(
        `[reloop:sentry-test] Synthetic client error at ${new Date().toISOString()}`,
      )
    }, 0)
  }

  async function triggerUnhandledRejection(): Promise<void> {
    setState({ status: "thrown", message: "Đã ném unhandled rejection." })
    // Intentional unhandled rejection.
    void Promise.reject(
      new Error(
        `[reloop:sentry-test] Synthetic unhandled rejection at ${new Date().toISOString()}`,
      ),
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={triggerClientError}
        className="rounded-md border border-red-500 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
      >
        Throw client error (sync)
      </button>
      <button
        type="button"
        onClick={triggerUnhandledRejection}
        className="rounded-md border border-amber-500 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
      >
        Throw unhandled promise rejection
      </button>
      {state.status === "thrown" ? (
        <p className="text-xs text-muted-foreground">
          {state.message} — kiểm tra Sentry dashboard.
        </p>
      ) : null}
    </div>
  )
}
