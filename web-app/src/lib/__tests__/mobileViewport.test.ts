import { afterEach, describe, expect, it, vi } from 'vitest'
import { installMobileViewportFix } from '@/lib/mobileViewport'

const originalVisualViewport = Object.getOwnPropertyDescriptor(
  window,
  'visualViewport'
)

afterEach(() => {
  vi.useRealTimers()
  document.documentElement.style.removeProperty('--app-viewport-height')
  if (originalVisualViewport) {
    Object.defineProperty(window, 'visualViewport', originalVisualViewport)
  } else {
    delete (window as Window & { visualViewport?: VisualViewport })
      .visualViewport
  }
})

describe('installMobileViewportFix', () => {
  it('tracks the visible viewport and rechecks it after focus leaves an input', () => {
    vi.useFakeTimers()
    const viewport = new EventTarget() as VisualViewport
    Object.defineProperty(viewport, 'height', {
      configurable: true,
      value: 500,
      writable: true,
    })
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    })

    const uninstall = installMobileViewportFix()
    expect(
      document.documentElement.style.getPropertyValue('--app-viewport-height')
    ).toBe('500px')

    ;(viewport as VisualViewport & { height: number }).height = 420
    viewport.dispatchEvent(new Event('resize'))
    expect(
      document.documentElement.style.getPropertyValue('--app-viewport-height')
    ).toBe('420px')

    ;(viewport as VisualViewport & { height: number }).height = 700
    document.dispatchEvent(new FocusEvent('focusout'))
    vi.advanceTimersByTime(300)
    expect(
      document.documentElement.style.getPropertyValue('--app-viewport-height')
    ).toBe('700px')

    uninstall()
    expect(
      document.documentElement.style.getPropertyValue('--app-viewport-height')
    ).toBe('')
  })
})
