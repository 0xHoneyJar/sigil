/**
 * Sigil v2.0 — CriticalZone Tests
 *
 * Tests for the CriticalZone layout primitive.
 *
 * @module __tests__/CriticalZone.test
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CriticalZone } from '../layouts/CriticalZone';
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
      <span data-testid="zone-financial">{String(zone.financial ?? false)}</span>
      <span data-testid="zone-time-authority">{zone.timeAuthority}</span>
    </div>
  );
}

/**
 * Mock CriticalButton component for testing auto-sorting.
 */
function MockCriticalButton({
  children,
  state,
}: {
  children: React.ReactNode;
  state: { status: string };
}) {
  return (
    <button data-testid="critical-button" data-status={state.status}>
      {children}
    </button>
  );
}

/**
 * Mock GlassButton component for testing.
 */
function MockGlassButton({
  children,
  onAction,
}: {
  children: React.ReactNode;
  onAction?: () => void;
}) {
  return (
    <button data-testid="glass-button" onClick={onAction}>
      {children}
    </button>
  );
}

// =============================================================================
// ZONE CONTEXT TESTS
// =============================================================================

describe('CriticalZone', () => {
  describe('zone context', () => {
    it('provides critical zone context', () => {
      render(
        <CriticalZone>
          <ZoneContextReader />
        </CriticalZone>
      );

      expect(screen.getByTestId('zone-type').textContent).toBe('critical');
    });

    it('provides financial=true by default', () => {
      render(
        <CriticalZone>
          <ZoneContextReader />
        </CriticalZone>
      );

      expect(screen.getByTestId('zone-financial').textContent).toBe('true');
    });

    it('provides financial=false when specified', () => {
      render(
        <CriticalZone financial={false}>
          <ZoneContextReader />
        </CriticalZone>
      );

      expect(screen.getByTestId('zone-financial').textContent).toBe('false');
    });

    it('provides server-tick time authority', () => {
      render(
        <CriticalZone>
          <ZoneContextReader />
        </CriticalZone>
      );

      expect(screen.getByTestId('zone-time-authority').textContent).toBe(
        'server-tick'
      );
    });

    it('sets correct data attributes', () => {
      const { container } = render(
        <CriticalZone financial>
          <div>Content</div>
        </CriticalZone>
      );

      const zone = container.querySelector('[data-sigil-zone="critical"]');
      expect(zone).toBeInTheDocument();
      expect(zone).toHaveAttribute('data-sigil-financial', 'true');
    });

    it('has correct ARIA attributes', () => {
      render(
        <CriticalZone financial>
          <div>Content</div>
        </CriticalZone>
      );

      expect(screen.getByRole('region')).toHaveAttribute(
        'aria-label',
        'Financial action zone'
      );
    });

    it('has non-financial ARIA label', () => {
      render(
        <CriticalZone financial={false}>
          <div>Content</div>
        </CriticalZone>
      );

      expect(screen.getByRole('region')).toHaveAttribute(
        'aria-label',
        'Critical action zone'
      );
    });
  });

  describe('CriticalZone.Content', () => {
    it('renders content slot', () => {
      render(
        <CriticalZone>
          <CriticalZone.Content>
            <h2>Confirm Payment</h2>
            <p>Amount: $500</p>
          </CriticalZone.Content>
        </CriticalZone>
      );

      expect(screen.getByText('Confirm Payment')).toBeInTheDocument();
      expect(screen.getByText('Amount: $500')).toBeInTheDocument();
    });

    it('sets correct data attribute', () => {
      const { container } = render(
        <CriticalZone>
          <CriticalZone.Content>Content</CriticalZone.Content>
        </CriticalZone>
      );

      const content = container.querySelector('[data-sigil-slot="content"]');
      expect(content).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <CriticalZone>
          <CriticalZone.Content className="custom-content">
            Content
          </CriticalZone.Content>
        </CriticalZone>
      );

      const content = container.querySelector('.sigil-critical-content');
      expect(content).toHaveClass('custom-content');
    });

    it('throws when used outside CriticalZone', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<CriticalZone.Content>Content</CriticalZone.Content>);
      }).toThrow('CriticalZone subcomponents must be used within a CriticalZone');

      consoleSpy.mockRestore();
    });
  });

  describe('CriticalZone.Actions', () => {
    it('renders action buttons', () => {
      render(
        <CriticalZone>
          <CriticalZone.Actions>
            <MockGlassButton>Cancel</MockGlassButton>
            <MockCriticalButton state={{ status: 'idle' }}>
              Confirm
            </MockCriticalButton>
          </CriticalZone.Actions>
        </CriticalZone>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('enforces 32px gap between actions', () => {
      const { container } = render(
        <CriticalZone>
          <CriticalZone.Actions>
            <MockGlassButton>Cancel</MockGlassButton>
            <MockCriticalButton state={{ status: 'idle' }}>
              Confirm
            </MockCriticalButton>
          </CriticalZone.Actions>
        </CriticalZone>
      );

      const actions = container.querySelector('[data-sigil-slot="actions"]');
      expect(actions).toHaveStyle({ gap: '32px' });
    });

    it('sets correct data attribute', () => {
      const { container } = render(
        <CriticalZone>
          <CriticalZone.Actions>
            <button>Action</button>
          </CriticalZone.Actions>
        </CriticalZone>
      );

      const actions = container.querySelector('[data-sigil-slot="actions"]');
      expect(actions).toBeInTheDocument();
    });

    it('throws when used outside CriticalZone', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<CriticalZone.Actions><button>Action</button></CriticalZone.Actions>);
      }).toThrow('CriticalZone subcomponents must be used within a CriticalZone');

      consoleSpy.mockRestore();
    });
  });

  describe('action auto-sorting', () => {
    it('sorts critical buttons to last position', () => {
      const { container } = render(
        <CriticalZone>
          <CriticalZone.Actions>
            <MockCriticalButton state={{ status: 'idle' }}>
              Confirm
            </MockCriticalButton>
            <MockGlassButton>Cancel</MockGlassButton>
          </CriticalZone.Actions>
        </CriticalZone>
      );

      const actions = container.querySelector('[data-sigil-slot="actions"]');
      const buttons = actions?.querySelectorAll('button');

      // Cancel should be first, Confirm (critical) should be last
      expect(buttons?.[0]?.textContent).toBe('Cancel');
      expect(buttons?.[1]?.textContent).toBe('Confirm');
    });

    it('maintains order when critical button is already last', () => {
      const { container } = render(
        <CriticalZone>
          <CriticalZone.Actions>
            <MockGlassButton>Cancel</MockGlassButton>
            <MockCriticalButton state={{ status: 'idle' }}>
              Confirm
            </MockCriticalButton>
          </CriticalZone.Actions>
        </CriticalZone>
      );

      const actions = container.querySelector('[data-sigil-slot="actions"]');
      const buttons = actions?.querySelectorAll('button');

      expect(buttons?.[0]?.textContent).toBe('Cancel');
      expect(buttons?.[1]?.textContent).toBe('Confirm');
    });

    it('handles multiple critical buttons', () => {
      const { container } = render(
        <CriticalZone>
          <CriticalZone.Actions>
            <MockCriticalButton state={{ status: 'idle' }}>
              Delete
            </MockCriticalButton>
            <MockGlassButton>Cancel</MockGlassButton>
            <MockCriticalButton state={{ status: 'idle' }}>
              Confirm
            </MockCriticalButton>
          </CriticalZone.Actions>
        </CriticalZone>
      );

      const actions = container.querySelector('[data-sigil-slot="actions"]');
      const buttons = actions?.querySelectorAll('button');

      // Non-critical first, critical buttons last (in their original order)
      expect(buttons?.[0]?.textContent).toBe('Cancel');
      expect(buttons?.[1]?.textContent).toBe('Delete');
      expect(buttons?.[2]?.textContent).toBe('Confirm');
    });

    it('handles no critical buttons', () => {
      const { container } = render(
        <CriticalZone>
          <CriticalZone.Actions>
            <MockGlassButton>Cancel</MockGlassButton>
            <MockGlassButton>Maybe</MockGlassButton>
          </CriticalZone.Actions>
        </CriticalZone>
      );

      const actions = container.querySelector('[data-sigil-slot="actions"]');
      const buttons = actions?.querySelectorAll('button');

      expect(buttons?.[0]?.textContent).toBe('Cancel');
      expect(buttons?.[1]?.textContent).toBe('Maybe');
    });
  });

  describe('maxActions warning', () => {
    it('warns when exceeding maxActions in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(
        <CriticalZone>
          <CriticalZone.Actions maxActions={2}>
            <MockGlassButton>Action 1</MockGlassButton>
            <MockGlassButton>Action 2</MockGlassButton>
            <MockGlassButton>Action 3</MockGlassButton>
          </CriticalZone.Actions>
        </CriticalZone>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Too many actions (3/2)')
      );

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('does not warn when under maxActions', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(
        <CriticalZone>
          <CriticalZone.Actions maxActions={3}>
            <MockGlassButton>Action 1</MockGlassButton>
            <MockGlassButton>Action 2</MockGlassButton>
          </CriticalZone.Actions>
        </CriticalZone>
      );

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('uses default maxActions of 3', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(
        <CriticalZone>
          <CriticalZone.Actions>
            <MockGlassButton>Action 1</MockGlassButton>
            <MockGlassButton>Action 2</MockGlassButton>
            <MockGlassButton>Action 3</MockGlassButton>
            <MockGlassButton>Action 4</MockGlassButton>
          </CriticalZone.Actions>
        </CriticalZone>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Too many actions (4/3)')
      );

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('styling', () => {
    it('applies custom className to CriticalZone', () => {
      const { container } = render(
        <CriticalZone className="custom-zone">
          <div>Content</div>
        </CriticalZone>
      );

      const zone = container.querySelector('.sigil-critical-zone');
      expect(zone).toHaveClass('custom-zone');
    });

    it('applies custom className to Actions', () => {
      const { container } = render(
        <CriticalZone>
          <CriticalZone.Actions className="custom-actions">
            <button>Action</button>
          </CriticalZone.Actions>
        </CriticalZone>
      );

      const actions = container.querySelector('.sigil-critical-actions');
      expect(actions).toHaveClass('custom-actions');
    });

    it('has flex layout with end alignment', () => {
      const { container } = render(
        <CriticalZone>
          <CriticalZone.Actions>
            <button>Action</button>
          </CriticalZone.Actions>
        </CriticalZone>
      );

      const actions = container.querySelector('[data-sigil-slot="actions"]');
      expect(actions).toHaveStyle({ display: 'flex' });
      expect(actions).toHaveStyle({ justifyContent: 'flex-end' });
    });
  });
});

// =============================================================================
// CONTEXT UTILITY TESTS
// =============================================================================

describe('useZoneContext', () => {
  it('returns default context when not in a layout', () => {
    function TestComponent() {
      const zone = useZoneContext();
      return (
        <div>
          <span data-testid="type">{zone.type}</span>
          <span data-testid="authority">{zone.timeAuthority}</span>
        </div>
      );
    }

    render(<TestComponent />);

    expect(screen.getByTestId('type').textContent).toBe('default');
    expect(screen.getByTestId('authority').textContent).toBe('optimistic');
  });

  it('returns CriticalZone context when nested', () => {
    function TestComponent() {
      const zone = useZoneContext();
      return <span data-testid="type">{zone.type}</span>;
    }

    render(
      <CriticalZone>
        <TestComponent />
      </CriticalZone>
    );

    expect(screen.getByTestId('type').textContent).toBe('critical');
  });
});
