/**
 * Sigil v2.0 Integration Tests
 *
 * Tests the full flow of Core → Layout → Lens integration
 */

import React from 'react';
import { renderHook, act, render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Core Layer
import { useCriticalAction, createInitialState } from '../core';

// Layout Layer
import { CriticalZone, MachineryLayout, GlassLayout, useZoneContext, ZoneContext } from '../layouts';

// Lens Layer
import { useLens, LensProvider, DefaultLens, StrictLens, A11yLens } from '../lenses';

// Types
import type { CriticalActionState } from '../core/types';

// =============================================================================
// TEST: PAYMENT FLOW (CriticalZone + useCriticalAction + StrictLens)
// =============================================================================

describe('Payment Flow Integration', () => {
  const mockMutation = jest.fn();

  beforeEach(() => {
    mockMutation.mockReset();
    mockMutation.mockResolvedValue({ success: true });
  });

  it('should force StrictLens in CriticalZone with financial=true', () => {
    let capturedLens: any;

    function TestComponent() {
      const Lens = useLens();
      capturedLens = Lens;
      return <div data-testid="test">{Lens.name}</div>;
    }

    render(
      <CriticalZone financial>
        <CriticalZone.Content>
          <TestComponent />
        </CriticalZone.Content>
      </CriticalZone>
    );

    expect(capturedLens.name).toBe('StrictLens');
  });

  it('should provide server-tick time authority in CriticalZone', () => {
    let capturedContext: any;

    function TestComponent() {
      const context = useZoneContext();
      capturedContext = context;
      return <div data-testid="context">{context.timeAuthority}</div>;
    }

    render(
      <CriticalZone financial>
        <CriticalZone.Content>
          <TestComponent />
        </CriticalZone.Content>
      </CriticalZone>
    );

    expect(capturedContext.type).toBe('critical');
    expect(capturedContext.financial).toBe(true);
    expect(capturedContext.timeAuthority).toBe('server-tick');
  });

  it('should render CriticalButton with all status states', () => {
    const states: CriticalActionState<any>['status'][] = [
      'idle',
      'confirming',
      'pending',
      'confirmed',
      'failed',
    ];

    states.forEach((status) => {
      const state: CriticalActionState<any> = {
        ...createInitialState(),
        status,
      };

      const { unmount } = render(
        <CriticalZone financial>
          <CriticalZone.Actions>
            <StrictLens.CriticalButton
              state={state}
              onAction={() => {}}
              data-testid={`button-${status}`}
            >
              Pay
            </StrictLens.CriticalButton>
          </CriticalZone.Actions>
        </CriticalZone>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-status', status);
      unmount();
    });
  });

  it('should complete full payment flow', async () => {
    let hookResult: any;

    function PaymentTest() {
      const payment = useCriticalAction({
        mutation: mockMutation,
        timeAuthority: 'server-tick',
      });
      hookResult = payment;

      const Lens = useLens();

      return (
        <CriticalZone financial>
          <CriticalZone.Content>
            <p>Amount: $100</p>
          </CriticalZone.Content>
          <CriticalZone.Actions>
            <Lens.CriticalButton
              state={payment.state}
              onAction={() => payment.commit()}
              labels={{
                pending: 'Processing...',
                confirmed: 'Paid!',
              }}
            >
              Pay $100
            </Lens.CriticalButton>
          </CriticalZone.Actions>
        </CriticalZone>
      );
    }

    render(<PaymentTest />);

    // Initial state
    expect(hookResult.state.status).toBe('idle');

    // Trigger payment
    await act(async () => {
      hookResult.commit();
    });

    // Should have called mutation
    expect(mockMutation).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// TEST: ADMIN LIST (MachineryLayout + keyboard navigation)
// =============================================================================

describe('Admin List Integration', () => {
  const mockOnAction = jest.fn();
  const mockOnDelete = jest.fn();

  const items = [
    { id: '1', title: 'Invoice #001' },
    { id: '2', title: 'Invoice #002' },
    { id: '3', title: 'Invoice #003' },
  ];

  beforeEach(() => {
    mockOnAction.mockReset();
    mockOnDelete.mockReset();
  });

  it('should provide admin zone context', () => {
    let capturedContext: any;

    function TestComponent() {
      const context = useZoneContext();
      capturedContext = context;
      return null;
    }

    render(
      <MachineryLayout stateKey="test" onAction={mockOnAction}>
        <TestComponent />
      </MachineryLayout>
    );

    expect(capturedContext.type).toBe('admin');
    expect(capturedContext.timeAuthority).toBe('optimistic');
  });

  it('should allow user lens preference in MachineryLayout', () => {
    let capturedLens: any;

    function TestComponent() {
      const Lens = useLens();
      capturedLens = Lens;
      return null;
    }

    render(
      <LensProvider initialLens={A11yLens}>
        <MachineryLayout stateKey="test" onAction={mockOnAction}>
          <TestComponent />
        </MachineryLayout>
      </LensProvider>
    );

    // In admin zone, user preference is respected
    expect(capturedLens.name).toBe('A11yLens');
  });

  it('should render MachineryItem for each item', () => {
    const Lens = DefaultLens;

    render(
      <MachineryLayout stateKey="invoices" onAction={mockOnAction} onDelete={mockOnDelete}>
        <MachineryLayout.List>
          {items.map((item) => (
            <Lens.MachineryItem key={item.id} id={item.id}>
              {item.title}
            </Lens.MachineryItem>
          ))}
        </MachineryLayout.List>
      </MachineryLayout>
    );

    items.forEach((item) => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    });
  });

  it('should support keyboard navigation', () => {
    const Lens = DefaultLens;

    render(
      <MachineryLayout stateKey="invoices" onAction={mockOnAction}>
        <MachineryLayout.List>
          {items.map((item) => (
            <Lens.MachineryItem key={item.id} id={item.id}>
              {item.title}
            </Lens.MachineryItem>
          ))}
        </MachineryLayout.List>
      </MachineryLayout>
    );

    const list = screen.getByRole('listbox');
    expect(list).toHaveAttribute('tabIndex', '0');
  });
});

// =============================================================================
// TEST: MARKETING CARD (GlassLayout + hover physics)
// =============================================================================

describe('Marketing Card Integration', () => {
  it('should provide marketing zone context', () => {
    let capturedContext: any;

    function TestComponent() {
      const context = useZoneContext();
      capturedContext = context;
      return null;
    }

    render(
      <GlassLayout variant="card">
        <TestComponent />
      </GlassLayout>
    );

    expect(capturedContext.type).toBe('marketing');
    expect(capturedContext.timeAuthority).toBe('optimistic');
  });

  it('should allow user lens preference in GlassLayout', () => {
    let capturedLens: any;

    function TestComponent() {
      const Lens = useLens();
      capturedLens = Lens;
      return null;
    }

    render(
      <LensProvider initialLens={A11yLens}>
        <GlassLayout variant="card">
          <TestComponent />
        </GlassLayout>
      </LensProvider>
    );

    // In marketing zone, user preference is respected
    expect(capturedLens.name).toBe('A11yLens');
  });

  it('should render all GlassLayout subcomponents', () => {
    render(
      <GlassLayout variant="card">
        <GlassLayout.Image src="/test.jpg" alt="Test" />
        <GlassLayout.Content>
          <GlassLayout.Title>Product Name</GlassLayout.Title>
          <GlassLayout.Description>Product description</GlassLayout.Description>
        </GlassLayout.Content>
        <GlassLayout.Actions>
          <button>Add to Cart</button>
        </GlassLayout.Actions>
      </GlassLayout>
    );

    expect(screen.getByText('Product Name')).toBeInTheDocument();
    expect(screen.getByText('Product description')).toBeInTheDocument();
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('should render GlassButton with variants', () => {
    const Lens = DefaultLens;
    const variants = ['primary', 'secondary', 'ghost'] as const;

    variants.forEach((variant) => {
      const { unmount } = render(
        <GlassLayout variant="card">
          <GlassLayout.Actions>
            <Lens.GlassButton variant={variant} data-testid={`btn-${variant}`}>
              {variant}
            </Lens.GlassButton>
          </GlassLayout.Actions>
        </GlassLayout>
      );

      expect(screen.getByTestId(`btn-${variant}`)).toBeInTheDocument();
      unmount();
    });
  });
});

// =============================================================================
// TEST: LENS LAYER INTEGRATION
// =============================================================================

describe('Lens Layer Integration', () => {
  it('should default to DefaultLens outside layouts', () => {
    let capturedLens: any;

    function TestComponent() {
      const Lens = useLens();
      capturedLens = Lens;
      return null;
    }

    render(<TestComponent />);

    expect(capturedLens.name).toBe('DefaultLens');
  });

  it('should respect LensProvider preference', () => {
    let capturedLens: any;

    function TestComponent() {
      const Lens = useLens();
      capturedLens = Lens;
      return null;
    }

    render(
      <LensProvider initialLens={A11yLens}>
        <TestComponent />
      </LensProvider>
    );

    expect(capturedLens.name).toBe('A11yLens');
  });

  it('should override preference in CriticalZone with financial=true', () => {
    let capturedLens: any;

    function TestComponent() {
      const Lens = useLens();
      capturedLens = Lens;
      return null;
    }

    render(
      <LensProvider initialLens={A11yLens}>
        <CriticalZone financial>
          <CriticalZone.Content>
            <TestComponent />
          </CriticalZone.Content>
        </CriticalZone>
      </LensProvider>
    );

    // StrictLens forced even with A11yLens preference
    expect(capturedLens.name).toBe('StrictLens');
  });

  it('should NOT override preference in CriticalZone with financial=false', () => {
    let capturedLens: any;

    function TestComponent() {
      const Lens = useLens();
      capturedLens = Lens;
      return null;
    }

    render(
      <LensProvider initialLens={A11yLens}>
        <CriticalZone financial={false}>
          <CriticalZone.Content>
            <TestComponent />
          </CriticalZone.Content>
        </CriticalZone>
      </LensProvider>
    );

    // A11yLens preference respected when financial=false
    expect(capturedLens.name).toBe('A11yLens');
  });
});

// =============================================================================
// TEST: FULL STACK INTEGRATION
// =============================================================================

describe('Full Stack Integration', () => {
  it('should render complete payment form with all layers', () => {
    function PaymentForm() {
      const payment = useCriticalAction({
        mutation: async () => ({ success: true }),
        timeAuthority: 'server-tick',
      });

      const Lens = useLens();

      return (
        <CriticalZone financial>
          <CriticalZone.Content>
            <h2>Confirm Payment</h2>
            <p>Amount: $500</p>
          </CriticalZone.Content>
          <CriticalZone.Actions>
            <button>Cancel</button>
            <Lens.CriticalButton
              state={payment.state}
              onAction={() => payment.commit()}
              labels={{
                confirming: 'Confirm?',
                pending: 'Processing...',
                confirmed: 'Paid!',
                failed: 'Retry',
              }}
            >
              Pay $500
            </Lens.CriticalButton>
          </CriticalZone.Actions>
        </CriticalZone>
      );
    }

    render(<PaymentForm />);

    expect(screen.getByText('Confirm Payment')).toBeInTheDocument();
    expect(screen.getByText('Amount: $500')).toBeInTheDocument();
    expect(screen.getByText('Pay $500')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should render complete admin list with all layers', () => {
    const invoices = [
      { id: '1', title: 'INV-001', amount: 100 },
      { id: '2', title: 'INV-002', amount: 200 },
    ];

    function InvoiceList() {
      const Lens = useLens();

      return (
        <MachineryLayout
          stateKey="invoices"
          onAction={(id) => console.log('View', id)}
          onDelete={(id) => console.log('Delete', id)}
        >
          <MachineryLayout.Search placeholder="Search invoices..." />
          <MachineryLayout.List>
            {invoices.map((inv) => (
              <Lens.MachineryItem key={inv.id} id={inv.id}>
                {inv.title} - ${inv.amount}
              </Lens.MachineryItem>
            ))}
          </MachineryLayout.List>
          <MachineryLayout.Empty>No invoices found</MachineryLayout.Empty>
        </MachineryLayout>
      );
    }

    render(<InvoiceList />);

    expect(screen.getByPlaceholderText('Search invoices...')).toBeInTheDocument();
    expect(screen.getByText('INV-001 - $100')).toBeInTheDocument();
    expect(screen.getByText('INV-002 - $200')).toBeInTheDocument();
  });

  it('should render complete product card with all layers', () => {
    function ProductCard() {
      const Lens = useLens();

      return (
        <GlassLayout variant="card">
          <GlassLayout.Image src="/product.jpg" alt="Product" />
          <GlassLayout.Content>
            <GlassLayout.Title>Amazing Widget</GlassLayout.Title>
            <GlassLayout.Description>The best widget ever made</GlassLayout.Description>
          </GlassLayout.Content>
          <GlassLayout.Actions>
            <Lens.GlassButton variant="secondary">Learn More</Lens.GlassButton>
            <Lens.GlassButton variant="primary">Buy Now</Lens.GlassButton>
          </GlassLayout.Actions>
        </GlassLayout>
      );
    }

    render(<ProductCard />);

    expect(screen.getByText('Amazing Widget')).toBeInTheDocument();
    expect(screen.getByText('The best widget ever made')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
    expect(screen.getByText('Buy Now')).toBeInTheDocument();
  });
});
