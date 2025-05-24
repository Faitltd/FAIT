import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Button from './Button.svelte';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(Button, { children: 'Click me' });
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    render(Button, { 
      props: { variant: 'primary' },
      children: 'Primary Button'
    });
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-fait-blue');
  });

  it('handles click events', async () => {
    const { component } = render(Button, { children: 'Click me' });
    const button = screen.getByRole('button');
    
    let clicked = false;
    component.$on('click', () => {
      clicked = true;
    });

    await button.click();
    expect(clicked).toBe(true);
  });

  it('can be disabled', () => {
    render(Button, { 
      props: { disabled: true },
      children: 'Disabled Button'
    });
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
