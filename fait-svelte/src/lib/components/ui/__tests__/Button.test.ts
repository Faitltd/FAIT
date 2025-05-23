import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Button from '../Button.svelte';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    const { getByRole } = render(Button, { props: { label: 'Click me' } });
    const button = getByRole('button');
    
    expect(button).toBeTruthy();
    expect(button.textContent).toBe('Click me');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.classList.contains('bg-fait-blue')).toBe(true);
  });

  it('renders as a link when href is provided', () => {
    const { getByRole } = render(Button, { 
      props: { 
        label: 'Go to page',
        href: '/some-page' 
      } 
    });
    
    const link = getByRole('link');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/some-page');
  });

  it('applies different variants correctly', () => {
    const { getByRole, rerender } = render(Button, { 
      props: { 
        label: 'Primary Button',
        variant: 'primary'
      } 
    });
    
    let button = getByRole('button');
    expect(button.classList.contains('bg-fait-blue')).toBe(true);
    
    rerender({ 
      label: 'Secondary Button',
      variant: 'secondary'
    });
    
    button = getByRole('button');
    expect(button.classList.contains('bg-fait-accent')).toBe(true);
    
    rerender({ 
      label: 'Outline Button',
      variant: 'outline'
    });
    
    button = getByRole('button');
    expect(button.classList.contains('border-fait-blue')).toBe(true);
  });

  it('applies different sizes correctly', () => {
    const { getByRole, rerender } = render(Button, { 
      props: { 
        label: 'Small Button',
        size: 'sm'
      } 
    });
    
    let button = getByRole('button');
    expect(button.classList.contains('text-xs')).toBe(true);
    
    rerender({ 
      label: 'Medium Button',
      size: 'md'
    });
    
    button = getByRole('button');
    expect(button.classList.contains('text-sm')).toBe(true);
    
    rerender({ 
      label: 'Large Button',
      size: 'lg'
    });
    
    button = getByRole('button');
    expect(button.classList.contains('text-base')).toBe(true);
  });

  it('disables the button when disabled prop is true', () => {
    const { getByRole } = render(Button, { 
      props: { 
        label: 'Disabled Button',
        disabled: true
      } 
    });
    
    const button = getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.classList.contains('opacity-50')).toBe(true);
    expect(button.classList.contains('cursor-not-allowed')).toBe(true);
  });

  it('shows loading state when loading prop is true', () => {
    const { getByRole, getByText } = render(Button, { 
      props: { 
        label: 'Loading Button',
        loading: true
      } 
    });
    
    const button = getByRole('button');
    const spinner = button.querySelector('.spinner');
    
    expect(spinner).toBeTruthy();
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('fires click event when clicked', async () => {
    const handleClick = vi.fn();
    const { getByRole } = render(Button, { 
      props: { 
        label: 'Click me'
      } 
    });
    
    const button = getByRole('button');
    
    // Set up event listener
    button.addEventListener('click', handleClick);
    
    // Simulate click
    await fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire click event when disabled', async () => {
    const handleClick = vi.fn();
    const { getByRole } = render(Button, { 
      props: { 
        label: 'Disabled Button',
        disabled: true
      } 
    });
    
    const button = getByRole('button');
    
    // Set up event listener
    button.addEventListener('click', handleClick);
    
    // Simulate click
    await fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });
});
