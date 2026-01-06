/**
 * Sigil v2.0 — MachineryLayout Tests
 *
 * Tests for the MachineryLayout keyboard-driven list component.
 *
 * @module __tests__/MachineryLayout.test
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MachineryLayout } from '../layouts/MachineryLayout';
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

describe('MachineryLayout', () => {
  describe('zone context', () => {
    it('provides admin zone context', () => {
      render(
        <MachineryLayout>
          <ZoneContextReader />
        </MachineryLayout>
      );

      expect(screen.getByTestId('zone-type').textContent).toBe('admin');
    });

    it('provides optimistic time authority', () => {
      render(
        <MachineryLayout>
          <ZoneContextReader />
        </MachineryLayout>
      );

      expect(screen.getByTestId('zone-time-authority').textContent).toBe(
        'optimistic'
      );
    });

    it('sets correct data attributes', () => {
      const { container } = render(
        <MachineryLayout stateKey="invoices">
          <div>Content</div>
        </MachineryLayout>
      );

      const zone = container.querySelector('[data-sigil-zone="admin"]');
      expect(zone).toBeInTheDocument();
      expect(zone).toHaveAttribute('data-sigil-state-key', 'invoices');
    });

    it('has correct ARIA attributes', () => {
      render(
        <MachineryLayout>
          <div>Content</div>
        </MachineryLayout>
      );

      expect(screen.getByRole('application')).toHaveAttribute(
        'aria-label',
        'Keyboard navigable list'
      );
    });
  });

  describe('MachineryLayout.List', () => {
    it('renders list container', () => {
      const { container } = render(
        <MachineryLayout>
          <MachineryLayout.List>
            <div>Items</div>
          </MachineryLayout.List>
        </MachineryLayout>
      );

      const list = container.querySelector('[data-sigil-slot="list"]');
      expect(list).toBeInTheDocument();
      expect(list).toHaveAttribute('role', 'listbox');
    });

    it('throws when used outside MachineryLayout', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<MachineryLayout.List><div>Items</div></MachineryLayout.List>);
      }).toThrow('MachineryLayout subcomponents must be used within a MachineryLayout');

      consoleSpy.mockRestore();
    });
  });

  describe('MachineryLayout.Item', () => {
    it('renders item with id', () => {
      const { container } = render(
        <MachineryLayout>
          <MachineryLayout.List>
            <MachineryLayout.Item id="item-1">Item 1</MachineryLayout.Item>
          </MachineryLayout.List>
        </MachineryLayout>
      );

      const item = container.querySelector('[data-sigil-item-id="item-1"]');
      expect(item).toBeInTheDocument();
      expect(item).toHaveAttribute('role', 'option');
    });

    it('activates on click', () => {
      const { container } = render(
        <MachineryLayout>
          <MachineryLayout.List>
            <MachineryLayout.Item id="item-1">Item 1</MachineryLayout.Item>
          </MachineryLayout.List>
        </MachineryLayout>
      );

      const item = container.querySelector('[data-sigil-item-id="item-1"]');
      fireEvent.click(item!);

      expect(item).toHaveAttribute('data-sigil-active', 'true');
      expect(item).toHaveAttribute('aria-selected', 'true');
    });

    it('calls onAction on double click', () => {
      const onAction = jest.fn();

      const { container } = render(
        <MachineryLayout onAction={onAction}>
          <MachineryLayout.List>
            <MachineryLayout.Item id="item-1">Item 1</MachineryLayout.Item>
          </MachineryLayout.List>
        </MachineryLayout>
      );

      const item = container.querySelector('[data-sigil-item-id="item-1"]');
      fireEvent.doubleClick(item!);

      expect(onAction).toHaveBeenCalledWith('item-1');
    });

    it('throws when used outside MachineryLayout', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<MachineryLayout.Item id="item-1">Item</MachineryLayout.Item>);
      }).toThrow('MachineryLayout subcomponents must be used within a MachineryLayout');

      consoleSpy.mockRestore();
    });
  });

  describe('MachineryLayout.Search', () => {
    it('renders search input', () => {
      render(
        <MachineryLayout>
          <MachineryLayout.Search placeholder="Filter..." />
        </MachineryLayout>
      );

      const input = screen.getByPlaceholderText('Filter...');
      expect(input).toBeInTheDocument();
    });

    it('calls onChange when typing', () => {
      const onChange = jest.fn();

      render(
        <MachineryLayout>
          <MachineryLayout.Search onChange={onChange} />
        </MachineryLayout>
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(onChange).toHaveBeenCalledWith('test');
    });

    it('supports controlled value', () => {
      render(
        <MachineryLayout>
          <MachineryLayout.Search value="controlled" onChange={() => {}} />
        </MachineryLayout>
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('controlled');
    });
  });

  describe('MachineryLayout.Empty', () => {
    it('renders empty state', () => {
      render(
        <MachineryLayout>
          <MachineryLayout.Empty>No items found</MachineryLayout.Empty>
        </MachineryLayout>
      );

      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('sets correct data attribute', () => {
      const { container } = render(
        <MachineryLayout>
          <MachineryLayout.Empty>Empty</MachineryLayout.Empty>
        </MachineryLayout>
      );

      const empty = container.querySelector('[data-sigil-slot="empty"]');
      expect(empty).toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('navigates down with ArrowDown', () => {
      const { container } = render(
        <MachineryLayout>
          <MachineryLayout.List>
            <MachineryLayout.Item id="item-1">Item 1</MachineryLayout.Item>
            <MachineryLayout.Item id="item-2">Item 2</MachineryLayout.Item>
          </MachineryLayout.List>
        </MachineryLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="admin"]')!;
      fireEvent.keyDown(layout, { key: 'ArrowDown' });

      const item1 = container.querySelector('[data-sigil-item-id="item-1"]');
      expect(item1).toHaveAttribute('data-sigil-active', 'true');

      fireEvent.keyDown(layout, { key: 'ArrowDown' });

      const item2 = container.querySelector('[data-sigil-item-id="item-2"]');
      expect(item2).toHaveAttribute('data-sigil-active', 'true');
    });

    it('navigates up with ArrowUp', () => {
      const { container } = render(
        <MachineryLayout>
          <MachineryLayout.List>
            <MachineryLayout.Item id="item-1">Item 1</MachineryLayout.Item>
            <MachineryLayout.Item id="item-2">Item 2</MachineryLayout.Item>
          </MachineryLayout.List>
        </MachineryLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="admin"]')!;

      // Navigate to second item
      fireEvent.keyDown(layout, { key: 'ArrowDown' });
      fireEvent.keyDown(layout, { key: 'ArrowDown' });

      // Navigate back up
      fireEvent.keyDown(layout, { key: 'ArrowUp' });

      const item1 = container.querySelector('[data-sigil-item-id="item-1"]');
      expect(item1).toHaveAttribute('data-sigil-active', 'true');
    });

    it('navigates with j/k (Vim-style)', () => {
      const { container } = render(
        <MachineryLayout>
          <MachineryLayout.List>
            <MachineryLayout.Item id="item-1">Item 1</MachineryLayout.Item>
            <MachineryLayout.Item id="item-2">Item 2</MachineryLayout.Item>
          </MachineryLayout.List>
        </MachineryLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="admin"]')!;

      // j = down
      fireEvent.keyDown(layout, { key: 'j' });
      const item1 = container.querySelector('[data-sigil-item-id="item-1"]');
      expect(item1).toHaveAttribute('data-sigil-active', 'true');

      fireEvent.keyDown(layout, { key: 'j' });
      const item2 = container.querySelector('[data-sigil-item-id="item-2"]');
      expect(item2).toHaveAttribute('data-sigil-active', 'true');

      // k = up
      fireEvent.keyDown(layout, { key: 'k' });
      expect(item1).toHaveAttribute('data-sigil-active', 'true');
    });

    it('activates with Enter', () => {
      const onAction = jest.fn();

      const { container } = render(
        <MachineryLayout onAction={onAction}>
          <MachineryLayout.List>
            <MachineryLayout.Item id="item-1">Item 1</MachineryLayout.Item>
          </MachineryLayout.List>
        </MachineryLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="admin"]')!;

      // Select item first
      fireEvent.keyDown(layout, { key: 'ArrowDown' });

      // Activate with Enter
      fireEvent.keyDown(layout, { key: 'Enter' });

      expect(onAction).toHaveBeenCalledWith('item-1');
    });

    it('activates with Space', () => {
      const onAction = jest.fn();

      const { container } = render(
        <MachineryLayout onAction={onAction}>
          <MachineryLayout.List>
            <MachineryLayout.Item id="item-1">Item 1</MachineryLayout.Item>
          </MachineryLayout.List>
        </MachineryLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="admin"]')!;

      fireEvent.keyDown(layout, { key: 'ArrowDown' });
      fireEvent.keyDown(layout, { key: ' ' });

      expect(onAction).toHaveBeenCalledWith('item-1');
    });

    it('deletes with Delete key', () => {
      const onDelete = jest.fn();

      const { container } = render(
        <MachineryLayout onDelete={onDelete}>
          <MachineryLayout.List>
            <MachineryLayout.Item id="item-1">Item 1</MachineryLayout.Item>
          </MachineryLayout.List>
        </MachineryLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="admin"]')!;

      fireEvent.keyDown(layout, { key: 'ArrowDown' });
      fireEvent.keyDown(layout, { key: 'Delete' });

      expect(onDelete).toHaveBeenCalledWith('item-1');
    });

    it('deletes with Backspace key', () => {
      const onDelete = jest.fn();

      const { container } = render(
        <MachineryLayout onDelete={onDelete}>
          <MachineryLayout.List>
            <MachineryLayout.Item id="item-1">Item 1</MachineryLayout.Item>
          </MachineryLayout.List>
        </MachineryLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="admin"]')!;

      fireEvent.keyDown(layout, { key: 'ArrowDown' });
      fireEvent.keyDown(layout, { key: 'Backspace' });

      expect(onDelete).toHaveBeenCalledWith('item-1');
    });

    it('deselects with Escape', () => {
      const { container } = render(
        <MachineryLayout>
          <MachineryLayout.List>
            <MachineryLayout.Item id="item-1">Item 1</MachineryLayout.Item>
          </MachineryLayout.List>
        </MachineryLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="admin"]')!;

      // Select item
      fireEvent.keyDown(layout, { key: 'ArrowDown' });
      const item = container.querySelector('[data-sigil-item-id="item-1"]');
      expect(item).toHaveAttribute('data-sigil-active', 'true');

      // Deselect
      fireEvent.keyDown(layout, { key: 'Escape' });
      expect(item).toHaveAttribute('data-sigil-active', 'false');
    });

    it('jumps to first with Home', () => {
      const { container } = render(
        <MachineryLayout>
          <MachineryLayout.List>
            <MachineryLayout.Item id="item-1">Item 1</MachineryLayout.Item>
            <MachineryLayout.Item id="item-2">Item 2</MachineryLayout.Item>
            <MachineryLayout.Item id="item-3">Item 3</MachineryLayout.Item>
          </MachineryLayout.List>
        </MachineryLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="admin"]')!;

      // Navigate to last
      fireEvent.keyDown(layout, { key: 'End' });
      const item3 = container.querySelector('[data-sigil-item-id="item-3"]');
      expect(item3).toHaveAttribute('data-sigil-active', 'true');

      // Jump to first
      fireEvent.keyDown(layout, { key: 'Home' });
      const item1 = container.querySelector('[data-sigil-item-id="item-1"]');
      expect(item1).toHaveAttribute('data-sigil-active', 'true');
    });

    it('jumps to last with End', () => {
      const { container } = render(
        <MachineryLayout>
          <MachineryLayout.List>
            <MachineryLayout.Item id="item-1">Item 1</MachineryLayout.Item>
            <MachineryLayout.Item id="item-2">Item 2</MachineryLayout.Item>
            <MachineryLayout.Item id="item-3">Item 3</MachineryLayout.Item>
          </MachineryLayout.List>
        </MachineryLayout>
      );

      const layout = container.querySelector('[data-sigil-zone="admin"]')!;

      fireEvent.keyDown(layout, { key: 'End' });

      const item3 = container.querySelector('[data-sigil-item-id="item-3"]');
      expect(item3).toHaveAttribute('data-sigil-active', 'true');
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <MachineryLayout className="custom-layout">
          <div>Content</div>
        </MachineryLayout>
      );

      const layout = container.querySelector('.sigil-machinery-layout');
      expect(layout).toHaveClass('custom-layout');
    });
  });
});
