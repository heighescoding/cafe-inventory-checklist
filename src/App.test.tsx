import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true })

describe('App', () => {
  it('defaults to Bathroom Cabinet and exposes all section tabs', () => {
    render(<App />)
    expect(screen.getByText('0 of 63')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bathroom Cabinet' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Kitchen' })).not.toBeInTheDocument()
    ;['Bathroom Cabinet', 'Kitchen', 'Behind Bar', 'Office', 'Garage', 'All'].forEach((tab) => {
      expect(screen.getByRole('button', { name: tab })).toBeInTheDocument()
    })
  })

  it('shows all five sections when All is selected', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'All' }))
    ;['Bathroom Cabinet', 'Kitchen', 'Behind Bar', 'Office', 'Garage'].forEach((section) => {
      expect(screen.getByRole('heading', { name: section })).toBeInTheDocument()
    })
  })

  it('keeps counts and notes when changing tabs and searching', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Napkins count'), '2')
    await user.type(screen.getByLabelText(/Napkins note/i), '1 case open')
    await user.click(screen.getByRole('button', { name: 'Kitchen' }))
    await user.click(screen.getByRole('button', { name: 'Bathroom Cabinet' }))
    expect(screen.getByLabelText('Napkins count')).toHaveValue(2)
    expect(screen.getByLabelText(/Napkins note/i)).toHaveValue('1 case open')
    const search = screen.getByRole('searchbox', { name: 'Search inventory' })
    await user.type(search, 'paper towels')
    expect(screen.getByText('Paper Towels')).toBeInTheDocument()
    await user.clear(search)
    expect(screen.getByLabelText('Napkins count')).toHaveValue(2)
  })

  it('searches only the active section unless All is selected', async () => {
    const user = userEvent.setup()
    render(<App />)
    const search = screen.getByRole('searchbox', { name: 'Search inventory' })
    await user.type(search, 'oat milk')
    expect(screen.getByText('No inventory items found')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(screen.getByText('Oat Milk')).toBeInTheDocument()
  })

  it('treats zero as completed while a note alone remains incomplete', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText(/Napkins note/i), 'out of stock')
    expect(screen.getByText('0 of 63')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Napkins count'), '0')
    expect(screen.getByText('1 of 63')).toBeInTheDocument()
  })

  it('opens review with the entered-count summary collapsed and preserves data on return', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Napkins count'), '1')
    await user.type(screen.getByLabelText(/Napkins note/i), 'open case')
    await user.click(screen.getByRole('button', { name: /review & submit summary/i }))
    const summary = screen.getByText('Review summary (1)')
    expect(summary.closest('details')).not.toHaveAttribute('open')
    await user.click(summary)
    expect(screen.getByText('open case')).toHaveClass('review-note')
    await user.click(screen.getByRole('button', { name: /back to inventory/i }))
    expect(screen.getByLabelText('Napkins count')).toHaveValue(1)
    expect(screen.getByLabelText(/Napkins note/i)).toHaveValue('open case')
  })

  it('offers summary actions on review', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Napkins count'), '1')
    await user.click(screen.getByRole('button', { name: /review & submit summary/i }))
    expect(screen.getByRole('button', { name: /download summary/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /email summary/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copy summary/i })).toBeInTheDocument()
  })
})
