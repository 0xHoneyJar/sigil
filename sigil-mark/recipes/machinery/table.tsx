/**
 * @sigil-recipe machinery/Table
 * @physics none (instant)
 * @zone admin, dashboard, data
 * @sync client_authoritative
 *
 * Data table for admin interfaces and dashboards.
 * No animation overhead - efficiency is the priority.
 *
 * Physics rationale:
 * - No springs - instant state changes
 * - No transitions - data is data
 * - No hover effects on rows - avoid visual noise
 */

import React from 'react';

export interface TableColumn<T> {
  /** Column identifier */
  key: keyof T | string;
  /** Column header label */
  header: string;
  /** Custom cell renderer */
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
  /** Column width (CSS value) */
  width?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  /** Data rows */
  data: T[];
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Unique key extractor */
  getRowKey: (row: T, index: number) => string | number;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Show header row */
  showHeader?: boolean;
  /** Additional class names */
  className?: string;
  /** Striped rows */
  striped?: boolean;
  /** Compact mode (less padding) */
  compact?: boolean;
}

/**
 * Efficient Data Table
 *
 * @example
 * ```tsx
 * import { Table } from '@sigil/recipes/machinery';
 *
 * <Table
 *   data={users}
 *   columns={[
 *     { key: 'name', header: 'Name' },
 *     { key: 'email', header: 'Email' },
 *     { key: 'role', header: 'Role', render: (v) => <Badge>{v}</Badge> },
 *   ]}
 *   getRowKey={(row) => row.id}
 *   onRowClick={(row) => navigate(`/users/${row.id}`)}
 * />
 * ```
 */
export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  getRowKey,
  onRowClick,
  emptyMessage = 'No data',
  showHeader = true,
  className = '',
  striped = false,
  compact = false,
}: TableProps<T>) {
  const getCellValue = (row: T, key: keyof T | string): T[keyof T] => {
    return row[key as keyof T];
  };

  const cellPadding = compact ? 'px-2 py-1' : 'px-4 py-3';
  const headerPadding = compact ? 'px-2 py-1.5' : 'px-4 py-3';

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        {showHeader && (
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`
                    ${headerPadding}
                    text-xs font-semibold uppercase tracking-wider
                    text-neutral-600
                    text-${column.align || 'left'}
                  `.trim().replace(/\s+/g, ' ')}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={`${cellPadding} text-center text-neutral-500`}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={getRowKey(row, rowIndex)}
                onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                className={`
                  border-b border-neutral-100
                  ${onRowClick ? 'cursor-pointer hover:bg-neutral-50' : ''}
                  ${striped && rowIndex % 2 === 1 ? 'bg-neutral-50' : ''}
                `.trim().replace(/\s+/g, ' ')}
              >
                {columns.map((column) => {
                  const value = getCellValue(row, column.key);
                  return (
                    <td
                      key={String(column.key)}
                      className={`
                        ${cellPadding}
                        text-sm text-neutral-900
                        text-${column.align || 'left'}
                      `.trim().replace(/\s+/g, ' ')}
                    >
                      {column.render
                        ? column.render(value, row, rowIndex)
                        : String(value ?? '')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
