/**
 * Sigil v2.0 — GlassLayout Tests
 *
 * Tests for the GlassLayout hover-driven card component.
 *
 * @module __tests__/GlassLayout.test
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GlassLayout } from '../layouts/GlassLayout';
import { useZoneContext } from '../layouts/context';

// =============================================================================
// TEST HELPERS
// =============================================================================

/**
 * Component that reads and displays zone context.
 */
function ZoneContextReader() {
  const zone = useZoneContext();
  return (
    <div data-testid="zone-reader">
      <span data-testid="zone-type">{zone.type}</span>
      <span data-testid="zone-time-authority">{zone.timeAuthority}</span>
    </div>
  );
}

// =============================================================================
// ZONE CONTEXT TESTS
// =============================================================================

describe('GlassLayout', () => {
  describe('zone context', () => {
    it('provides marketing zone context', () => {
      render(
        <GlassLayout>
          <ZoneContextReader />
        </GlassLayout>
      );

      expect(screen.getByTestId('zone-type').textContent).toBe('marketing');
    });

    it('provides optimistic time authority', () => {
      render(
        <GlassLayout>
          <ZoneContextReader />
        </GlassLayout>
      );

      expect(screen.getByTestId('zone-time-authority').textContent).toBe(
        'optimistic'
      );
    });

    it('sets correct data attributes', () => {
      const { container } = render(
        <GlassLayout variant="card">
          <div>Content</div>
        </GlassLayout>
      );

      const zone = container.querySelector('[data-sigil-zone="marketing"]');
      expect(zone).toBeInTheDocument();
      expect(zone).toHaveAttribute('data-sigil-variant', 'card');
    });

    it('defaults to card variant', () => {
      const { container } = render(
        <GlassLayout>
          <div>Content</div>
        </GlassLayout>
      );

      const zone = container.querySelector('[data-sigil-variant="card"]');
      expect(zone).toBeInTheDocument();
    });

    it('supports hero variant', () => {
      const { container } = render(
        <GlassLayout variant="hero">
          <div>Content</div>
        </GlassLayout>
      );

      const zone = container.querySelector('[data-sigil-variant="hero"]');
      expect(zone).toBeInTheDocument();
    });

    it('supports feature variant', () => {
      const { container } = render(
        <GlassLayout variant="feature">
          <div>Content</div>
        </GlassLayout>
      );

      const zone = container.querySelector('[data-sigil-variant="feature"]');
      expect(zone).toBeInTheDocument();
    });
  });

  describe('GlassLayout.Image', () => {
    it('renders image', () => {
      render(
        <GlassLayout>
          <GlassLayout.Image src="test.jpg" alt="Test image" />
        </GlassLayout>
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'test.jpg');
      expect(img).toHaveAttribute('alt', 'Test image');
    });

    it('sets correct data attribute', () => {
      const { container } = render(
        <GlassLayout>
          <GlassLayout.Image src="test.jpg" />
        </GlassLayout>
      );

      const slot = container.querySelector('[data-sigil-slot="image"]');
      expect(slot).toBeInTheDocument();
    });

    it('throws when used outside GlassLayout', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<GlassLayout.Image src="test.jpg" />);
      }).toThrow('GlassLayout subcomponents must be used within a GlassLayout');

      consoleSpy.mockRestore();
    });
  });

  describe('GlassLayout.Content', () => {
    it('renders content', () => {
      render(
        <GlassLayout>
          <GlassLayout.Content>
            <p>Content text</p>
          </GlassLayout.Content>
        </GlassLayout>
      );

      expect(screen.getByText('Content text')).toBeInTheDocument();
    });

    it('sets correct data attribute', () => {
      const { container } = render(
        <GlassLayout>
          <GlassLayout.Content>Content</GlassLayout.Content>
        </GlassLayout>
      );

      const slot = container.querySelector('[data-sigil-slot="content"]');
      expect(slot).toBeInTheDocument();
    });

    it('throws when used outside GlassLayout', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<GlassLayout.Content>Content</GlassLayout.Content>);
      }).toThrow('GlassLayout subcomponents must be used within a GlassLayout');

      consoleSpy.mockRestore();
    });
  });

  describe('GlassLayout.Title', () => {
    it('renders title', () => {
      render(
        <GlassLayout>
          <GlassLayout.Content>
            <GlassLayout.Title>Product Title</GlassLayout.Title>
          </GlassLayout.Content>
        </GlassLayout>
      );

      expect(screen.getByText('Product Title')).toBeInTheDocument();
    });

    it('renders as h3', () => {
      render(
        <GlassLayout>
          <GlassLayout.Content>
            <GlassLayout.Title>Product Title</GlassLayout.Title>
          </GlassLayout.Content>
        </GlassLayout>
      );

      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('sets correct data attribute', () => {
      const { container } = render(
        <GlassLayout>
          <GlassLayout.Content>
            <GlassLayout.Title>Title</GlassLayout.Title>
          </GlassLayout.Content>
        </GlassLayout>
      );

      const slot = container.querySelector('[data-sigil-slot="title"]');
      expect(slot).toBeInTheDocument();
    });
  });

  describe('GlassLayout.Description', () => {
    it('renders description', () => {
      render(
        <GlassLayout>
          <GlassLayout.Content>
            <GlassLayout.Description>Product description</GlassLayout.Description>
          </GlassLayout.Content>
        </GlassLayout>
      );

      expect(screen.getByText('Product description')).toBeInTheDocument();
    });

    it('sets correct data attribute', () => {
      const { container } = render(
        <GlassLayout>
          <GlassLayout.Content>
            <GlassLayout.Description>Description</GlassLayout.Description>
          </GlassLayout.Content>
        </GlassLayout>
      );

      const slot = container.querySelector('[data-sigil-slot="description"]');
      expect(slot).toBeInTheDocument();
    });
  });

  describe('GlassLayout.Actions', () => {
    it('renders actions', () => {
      render(
        <GlassLayout>
          <GlassLayout.Actions>
            <button>Action 1</button>
            <button>Action 2</button>
          </GlassLayout.Actions>
        </GlassLayout>
      );

      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
    });

    it('sets correct data attribute', () => {
      const { container } = render(
        <GlassLayout>
          <GlassLayout.Actions>
            <button>Action</button>
          </GlassLayout.Actions>
        </GlassLayout>
      );

      const slot = container.querySelector('[data-sigil-slot="actions"]');
      expect(slot).toBeInTheDocument();
    });

    it('has flex layout with gap', () => {
      const { container } = render(
        <GlassLayout>
          <GlassLayout.Actions>
            <button>Action</button>
          </GlassLayout.Actions>
        </GlassLayout>
      );

      const slot = container.querySelector('[data-sigil-slot="actions"]');
      expect(slot).toHaveStyle({ display: 'flex' });
      expect(slot).toHaveStyle({ gap: '12px' });
    });
  });

  describe('hover physics', () => {
    it('sets hovered state on mouse enter', () => {
      const { container } = render(
        <GlassLayout>
          <div>Content</div>
        </GlassLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="marketing"]')!;

      expect(layout).toHaveAttribute('data-sigil-hovered', 'false');

      fireEvent.mouseEnter(layout);

      expect(layout).toHaveAttribute('data-sigil-hovered', 'true');
    });

    it('clears hovered state on mouse leave', () => {
      const { container } = render(
        <GlassLayout>
          <div>Content</div>
        </GlassLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="marketing"]')!;

      fireEvent.mouseEnter(layout);
      expect(layout).toHaveAttribute('data-sigil-hovered', 'true');

      fireEvent.mouseLeave(layout);
      expect(layout).toHaveAttribute('data-sigil-hovered', 'false');
    });

    it('applies hover transform on hover', () => {
      const { container } = render(
        <GlassLayout variant="card">
          <div>Content</div>
        </GlassLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="marketing"]')!;

      // Before hover
      expect(layout).toHaveStyle({ transform: 'scale(1) translateY(0)' });

      // After hover
      fireEvent.mouseEnter(layout);
      expect(layout).toHaveStyle({ transform: 'scale(1.02) translateY(-4px)' });
    });

    it('applies backdrop blur', () => {
      const { container } = render(
        <GlassLayout>
          <div>Content</div>
        </GlassLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="marketing"]')!;
      expect(layout).toHaveStyle({ backdropFilter: 'blur(16px)' });
    });

    it('applies transition', () => {
      const { container } = render(
        <GlassLayout>
          <div>Content</div>
        </GlassLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="marketing"]')!;
      expect(layout).toHaveStyle({ transition: 'all 200ms ease-out' });
    });

    it('has glassmorphism styles', () => {
      const { container } = render(
        <GlassLayout>
          <div>Content</div>
        </GlassLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="marketing"]')!;
      expect(layout).toHaveStyle({ backgroundColor: 'rgba(255, 255, 255, 0.8)' });
      expect(layout).toHaveStyle({ borderRadius: '12px' });
    });
  });

  describe('variant-specific hover physics', () => {
    it('card variant uses scale 1.02', () => {
      const { container } = render(
        <GlassLayout variant="card">
          <div>Content</div>
        </GlassLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="marketing"]')!;
      fireEvent.mouseEnter(layout);

      expect(layout).toHaveStyle({ transform: 'scale(1.02) translateY(-4px)' });
    });

    it('hero variant uses scale 1.01', () => {
      const { container } = render(
        <GlassLayout variant="hero">
          <div>Content</div>
        </GlassLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="marketing"]')!;
      fireEvent.mouseEnter(layout);

      expect(layout).toHaveStyle({ transform: 'scale(1.01) translateY(-2px)' });
    });

    it('feature variant uses scale 1.015', () => {
      const { container } = render(
        <GlassLayout variant="feature">
          <div>Content</div>
        </GlassLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="marketing"]')!;
      fireEvent.mouseEnter(layout);

      expect(layout).toHaveStyle({ transform: 'scale(1.015) translateY(-3px)' });
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <GlassLayout className="custom-glass">
          <div>Content</div>
        </GlassLayout>
      );

      const layout = container.querySelector('.sigil-glass-layout');
      expect(layout).toHaveClass('custom-glass');
    });

    it('applies custom className to subcomponents', () => {
      const { container } = render(
        <GlassLayout>
          <GlassLayout.Content className="custom-content">
            Content
          </GlassLayout.Content>
        </GlassLayout>
      );

      const content = container.querySelector('.sigil-glass-content');
      expect(content).toHaveClass('custom-content');
    });
  });

  describe('complete card example', () => {
    it('renders full card with all slots', () => {
      const { container } = render(
        <GlassLayout variant="card">
          <GlassLayout.Image src="product.jpg" alt="Product" />
          <GlassLayout.Content>
            <GlassLayout.Title>Product Name</GlassLayout.Title>
            <GlassLayout.Description>Product description text</GlassLayout.Description>
          </GlassLayout.Content>
          <GlassLayout.Actions>
            <button>Add to Cart</button>
          </GlassLayout.Actions>
        </GlassLayout>
      );

      expect(screen.getByRole('img')).toHaveAttribute('alt', 'Product');
      expect(screen.getByText('Product Name')).toBeInTheDocument();
      expect(screen.getByText('Product description text')).toBeInTheDocument();
      expect(screen.getByText('Add to Cart')).toBeInTheDocument();

      // Verify slot structure
      expect(container.querySelector('[data-sigil-slot="image"]')).toBeInTheDocument();
      expect(container.querySelector('[data-sigil-slot="content"]')).toBeInTheDocument();
      expect(container.querySelector('[data-sigil-slot="title"]')).toBeInTheDocument();
      expect(container.querySelector('[data-sigil-slot="description"]')).toBeInTheDocument();
      expect(container.querySelector('[data-sigil-slot="actions"]')).toBeInTheDocument();
    });
  });
});
