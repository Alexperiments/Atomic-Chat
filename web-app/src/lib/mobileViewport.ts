const VIEWPORT_HEIGHT_PROPERTY = '--app-viewport-height'

/**
 * Keep the application shell matched to Android/iOS's visible viewport while
 * the software keyboard animates. WebView can otherwise leave the document
 * scrolled to the focused input after the IME closes.
 */
export function installMobileViewportFix(): () => void {
  const viewport = window.visualViewport
  const pendingTimers = new Set<number>()

  const syncViewport = () => {
    const height = viewport?.height ?? window.innerHeight
    document.documentElement.style.setProperty(
      VIEWPORT_HEIGHT_PROPERTY,
      `${Math.round(height)}px`
    )

    if (window.scrollX !== 0 || window.scrollY !== 0) {
      window.scrollTo(0, 0)
    }
  }

  const scheduleViewportRestore = () => {
    syncViewport()
    for (const delay of [50, 300]) {
      const timer = window.setTimeout(() => {
        pendingTimers.delete(timer)
        syncViewport()
      }, delay)
      pendingTimers.add(timer)
    }
  }

  syncViewport()
  window.addEventListener('resize', syncViewport)
  viewport?.addEventListener('resize', syncViewport)
  viewport?.addEventListener('scroll', syncViewport)
  document.addEventListener('focusout', scheduleViewportRestore)

  return () => {
    window.removeEventListener('resize', syncViewport)
    viewport?.removeEventListener('resize', syncViewport)
    viewport?.removeEventListener('scroll', syncViewport)
    document.removeEventListener('focusout', scheduleViewportRestore)
    pendingTimers.forEach((timer) => window.clearTimeout(timer))
    document.documentElement.style.removeProperty(VIEWPORT_HEIGHT_PROPERTY)
  }
}
