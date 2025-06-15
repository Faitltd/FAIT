import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from '../Toast';

describe('Toast', () => {
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    jest.useFakeTimers();
    mockOnClose.mockClear();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('renders with the correct content', () => {
    render(
      <Toast
        id="test-toast"
        type="success"
        title="Success Title"
        message="Success message"
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Success Title')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });
  
  it('renders different types correctly', () => {
    const { rerender } = render(
      <Toast
        id="test-toast"
        type="success"
        message="Success message"
        onClose={mockOnClose}
      />
    );
    
    // Success toast should have green styling
    const successToast = screen.getByRole('alert');
    expect(successToast).toHaveClass('bg-green-50');
    
    // Rerender with error type
    rerender(
      <Toast
        id="test-toast"
        type="error"
        message="Error message"
        onClose={mockOnClose}
      />
    );
    
    // Error toast should have red styling
    const errorToast = screen.getByRole('alert');
    expect(errorToast).toHaveClass('bg-red-50');
  });
  
  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <Toast
        id="test-toast"
        type="info"
        message="Info message"
        onClose={mockOnClose}
      />
    );
    
    // Click the close button
    await user.click(screen.getByRole('button'));
    
    // Wait for the exit animation
    jest.advanceTimersByTime(300);
    
    expect(mockOnClose).toHaveBeenCalledWith('test-toast');
  });
  
  it('automatically closes after the duration', async () => {
    render(
      <Toast
        id="test-toast"
        type="info"
        message="Info message"
        duration={2000}
        onClose={mockOnClose}
      />
    );
    
    // Fast-forward time
    jest.advanceTimersByTime(2000);
    
    // Wait for the exit animation
    jest.advanceTimersByTime(300);
    
    expect(mockOnClose).toHaveBeenCalledWith('test-toast');
  });
});
