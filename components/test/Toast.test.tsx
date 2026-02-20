import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Toast, { ToastMessage } from '../Toast';

describe('Toast Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnClose.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultToast: ToastMessage = {
    id: 'test-id',
    type: 'success',
    message: 'Test Message',
  };

  it('renders the toast message correctly', () => {
    render(<Toast toast={defaultToast} onClose={mockOnClose} />);
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('renders success style correctly', () => {
    const { container } = render(<Toast toast={{ ...defaultToast, type: 'success' }} onClose={mockOnClose} />);
    const iconContainer = container.querySelector('.bg-green-100');
    expect(iconContainer).toBeInTheDocument();
  });

  it('renders error style correctly', () => {
    const { container } = render(<Toast toast={{ ...defaultToast, type: 'error' }} onClose={mockOnClose} />);
    const iconContainer = container.querySelector('.bg-red-100');
    expect(iconContainer).toBeInTheDocument();
  });

  it('renders info style correctly', () => {
    const { container } = render(<Toast toast={{ ...defaultToast, type: 'info' }} onClose={mockOnClose} />);
    const iconContainer = container.querySelector('.bg-blue-100');
    expect(iconContainer).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<Toast toast={defaultToast} onClose={mockOnClose} />);
    const closeBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledWith('test-id');
  });

  it('auto-closes after 5000ms by default', () => {
    render(<Toast toast={defaultToast} onClose={mockOnClose} />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockOnClose).toHaveBeenCalledWith('test-id');
  });

  it('does not auto-close before 5000ms by default', () => {
    render(<Toast toast={defaultToast} onClose={mockOnClose} />);

    act(() => {
      vi.advanceTimersByTime(4999);
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('renders action button when action is provided', () => {
    const actionToast: ToastMessage = {
      ...defaultToast,
      action: {
        label: 'Undo',
        onClick: vi.fn(),
      },
    };
    render(<Toast toast={actionToast} onClose={mockOnClose} />);
    expect(screen.getByText('Undo')).toBeInTheDocument();
  });

  it('calls action onClick and onClose when action button is clicked', () => {
    const mockActionClick = vi.fn();
    const actionToast: ToastMessage = {
      ...defaultToast,
      action: {
        label: 'Retry',
        onClick: mockActionClick,
      },
    };
    render(<Toast toast={actionToast} onClose={mockOnClose} />);

    const actionButton = screen.getByText('Retry');
    fireEvent.click(actionButton);

    expect(mockActionClick).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalledWith('test-id');
  });

  it('auto-closes after 8000ms when action is provided', () => {
    const actionToast: ToastMessage = {
      ...defaultToast,
      action: {
        label: 'Undo',
        onClick: vi.fn(),
      },
    };
    render(<Toast toast={actionToast} onClose={mockOnClose} />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(mockOnClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000); // Total 8000ms
    });
    expect(mockOnClose).toHaveBeenCalledWith('test-id');
  });
});
