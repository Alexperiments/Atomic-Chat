import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CardItem } from '../Card'

describe('CardItem', () => {
  it('does not force both sides of a settings row to full width', () => {
    render(
      <CardItem
        title="Check for updates"
        description="Look for a newer version."
        actions={<button type="button">Check</button>}
      />
    )

    const textBlock = screen.getByText('Check for updates').parentElement
    const actionBlock = screen.getByRole('button').parentElement

    expect(textBlock).toHaveClass('min-w-0', 'flex-1')
    expect(textBlock).not.toHaveClass('w-full')
    expect(actionBlock).toHaveClass('max-w-full', 'shrink-0')
    expect(actionBlock).not.toHaveClass('w-full')
  })
})
