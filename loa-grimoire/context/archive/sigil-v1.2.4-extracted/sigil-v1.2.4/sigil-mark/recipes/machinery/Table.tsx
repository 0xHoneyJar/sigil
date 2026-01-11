/**
 * @sigil-recipe machinery/Table
 * @physics none - instant state, no animation
 * @zone admin, dashboard, utility
 * @sync client_authoritative
 */

import { type ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Machinery Table - Zero animation, instant feedback
 * 
 * For admin interfaces where efficiency > delight.
 * No springs, no transitions, just data.
 */
export function Table<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No data',
  className = '',
}: TableProps<T>) {
  const getValue = (row: T, key: string): any => {
    const keys = key.split('.');
    let value: any = row;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  };

  if (isLoading) {
    return (
      <div className={`border rounded-lg overflow-hidden ${className}`}>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b last:border-0">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`border rounded-lg p-8 text-center text-gray-500 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`
                  px-4 py-3 text-sm font-medium text-gray-700
                  ${col.align === 'center' ? 'text-center' : ''}
                  ${col.align === 'right' ? 'text-right' : 'text-left'}
                `}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={`
                border-b last:border-0
                ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              `}
            >
              {columns.map((col) => {
                const value = getValue(row, String(col.key));
                return (
                  <td
                    key={String(col.key)}
                    className={`
                      px-4 py-3 text-sm text-gray-900
                      ${col.align === 'center' ? 'text-center' : ''}
                      ${col.align === 'right' ? 'text-right' : 'text-left'}
                    `}
                  >
                    {col.render ? col.render(value, row) : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
