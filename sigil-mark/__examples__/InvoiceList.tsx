/**
 * Sigil v2.0 Example: Invoice List
 *
 * Demonstrates admin list pattern using:
 * - Layout: MachineryLayout with keyboard navigation
 * - Lens: useLens (respects user preference)
 *
 * @example
 * ```tsx
 * import { InvoiceList } from 'sigil-mark/__examples__/InvoiceList';
 *
 * function AdminDashboard() {
 *   return (
 *     <InvoiceList
 *       invoices={invoices}
 *       onView={(id) => router.push(`/invoices/${id}`)}
 *       onDelete={(id) => deleteInvoice(id)}
 *     />
 *   );
 * }
 * ```
 */

import React, { useState, useMemo } from 'react';
import { MachineryLayout, useLens } from '..';

// =============================================================================
// TYPES
// =============================================================================

export interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  date: string;
}

export interface InvoiceListProps {
  /** List of invoices to display */
  invoices: Invoice[];
  /** Called when user selects an invoice */
  onView?: (id: string) => void;
  /** Called when user deletes an invoice */
  onDelete?: (id: string) => void;
  /** Currency symbol */
  currency?: string;
}

// =============================================================================
// MOCK DATA
// =============================================================================

export const mockInvoices: Invoice[] = [
  { id: '1', number: 'INV-001', client: 'Acme Corp', amount: 1500.00, status: 'paid', date: '2026-01-01' },
  { id: '2', number: 'INV-002', client: 'Globex Inc', amount: 2750.50, status: 'sent', date: '2026-01-02' },
  { id: '3', number: 'INV-003', client: 'Initech', amount: 890.00, status: 'overdue', date: '2025-12-15' },
  { id: '4', number: 'INV-004', client: 'Umbrella Corp', amount: 3200.00, status: 'draft', date: '2026-01-05' },
  { id: '5', number: 'INV-005', client: 'Wayne Enterprises', amount: 15000.00, status: 'sent', date: '2026-01-04' },
];

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

const STATUS_COLORS: Record<Invoice['status'], string> = {
  draft: '#6b7280',
  sent: '#3b82f6',
  paid: '#10b981',
  overdue: '#ef4444',
};

function StatusBadge({ status }: { status: Invoice['status'] }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        fontSize: '12px',
        fontWeight: 600,
        borderRadius: '4px',
        backgroundColor: `${STATUS_COLORS[status]}20`,
        color: STATUS_COLORS[status],
        textTransform: 'uppercase',
      }}
    >
      {status}
    </span>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * InvoiceList — Admin list with keyboard navigation
 *
 * Architecture:
 * - `MachineryLayout` provides admin zone context (optimistic time authority)
 * - `useLens()` returns user preference (DefaultLens by default)
 * - Keyboard navigation: Arrow keys, j/k, Enter, Delete, Escape
 *
 * Zone Behavior:
 * - Admin zone allows optimistic updates
 * - User can choose their preferred lens (Default, Strict, A11y)
 * - Focus management handled by MachineryLayout
 */
export function InvoiceList({
  invoices,
  onView,
  onDelete,
  currency = '$',
}: InvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const Lens = useLens();

  // Filter invoices by search query
  const filteredInvoices = useMemo(() => {
    if (!searchQuery) return invoices;
    const query = searchQuery.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.number.toLowerCase().includes(query) ||
        inv.client.toLowerCase().includes(query)
    );
  }, [invoices, searchQuery]);

  // Format currency
  const formatAmount = (amount: number) =>
    `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <MachineryLayout
      stateKey="invoices"
      onAction={(id) => onView?.(id)}
      onDelete={(id) => {
        if (confirm('Are you sure you want to delete this invoice?')) {
          onDelete?.(id);
        }
      }}
    >
      {/* Search input */}
      <MachineryLayout.Search
        placeholder="Search invoices by number or client..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Invoice list */}
      <MachineryLayout.List>
        {filteredInvoices.map((invoice) => (
          <Lens.MachineryItem
            key={invoice.id}
            id={invoice.id}
            onAction={() => onView?.(invoice.id)}
            onDelete={() => onDelete?.(invoice.id)}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: '16px',
              }}
            >
              {/* Left: Number and Client */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{invoice.number}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {invoice.client}
                </div>
              </div>

              {/* Center: Date */}
              <div style={{ color: '#6b7280', fontSize: '14px' }}>
                {invoice.date}
              </div>

              {/* Right: Amount and Status */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600 }}>{formatAmount(invoice.amount)}</div>
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          </Lens.MachineryItem>
        ))}
      </MachineryLayout.List>

      {/* Empty state */}
      <MachineryLayout.Empty>
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
            No invoices found
          </p>
          <p style={{ color: '#6b7280' }}>
            {searchQuery
              ? `No results for "${searchQuery}"`
              : 'Create your first invoice to get started'}
          </p>
        </div>
      </MachineryLayout.Empty>
    </MachineryLayout>
  );
}

export default InvoiceList;
