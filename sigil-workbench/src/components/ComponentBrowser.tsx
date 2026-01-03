/**
 * Component Browser
 *
 * Browse and preview project components with current tensions applied.
 * Note: Full component discovery requires AST parsing; this is a simplified version.
 */

import { useState } from 'react';
import { clsx } from 'clsx';

interface ComponentBrowserProps {
  components?: ComponentInfo[];
}

interface ComponentInfo {
  name: string;
  path: string;
  category: string;
}

// Default demo components
const DEFAULT_COMPONENTS: ComponentInfo[] = [
  { name: 'Button', path: 'components/Button.tsx', category: 'Core' },
  { name: 'Card', path: 'components/Card.tsx', category: 'Core' },
  { name: 'Input', path: 'components/Input.tsx', category: 'Form' },
  { name: 'Select', path: 'components/Select.tsx', category: 'Form' },
  { name: 'Modal', path: 'components/Modal.tsx', category: 'Overlay' },
  { name: 'Tooltip', path: 'components/Tooltip.tsx', category: 'Overlay' },
  { name: 'Badge', path: 'components/Badge.tsx', category: 'Data' },
  { name: 'Avatar', path: 'components/Avatar.tsx', category: 'Data' },
];

export function ComponentBrowser({
  components = DEFAULT_COMPONENTS,
}: ComponentBrowserProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  // Get unique categories
  const categories = [...new Set(components.map((c) => c.category))];

  // Filter components
  const filteredComponents = components.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-sigil-border p-4">
        <h2 className="text-sm font-semibold text-sigil-text mb-3">
          Component Browser
        </h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Search components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={clsx(
            'w-full px-3 py-2 text-sm rounded-sigil border transition-all',
            'bg-sigil-bg border-sigil-border text-sigil-text',
            'placeholder:text-sigil-muted focus:border-sigil-accent focus:outline-none'
          )}
        />

        {/* Category Filter */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={clsx(
              'px-2 py-1 text-xs rounded transition-colors',
              !selectedCategory
                ? 'bg-sigil-accent text-white'
                : 'bg-sigil-surface text-sigil-muted hover:text-sigil-text'
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={clsx(
                'px-2 py-1 text-xs rounded transition-colors',
                selectedCategory === cat
                  ? 'bg-sigil-accent text-white'
                  : 'bg-sigil-surface text-sigil-muted hover:text-sigil-text'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-2">
          {filteredComponents.map((component) => (
            <button
              key={component.path}
              onClick={() => setSelectedComponent(component.name)}
              className={clsx(
                'p-3 rounded-sigil border text-left transition-all',
                selectedComponent === component.name
                  ? 'border-sigil-accent bg-sigil-accent/10'
                  : 'border-sigil-border bg-sigil-surface hover:border-sigil-muted'
              )}
            >
              <div className="text-sm font-medium text-sigil-text">
                {component.name}
              </div>
              <div className="text-xs text-sigil-muted truncate">
                {component.path}
              </div>
            </button>
          ))}
        </div>

        {filteredComponents.length === 0 && (
          <div className="text-center text-sigil-muted text-sm py-8">
            No components found
          </div>
        )}
      </div>

      {/* Selected Component Preview */}
      {selectedComponent && (
        <div className="border-t border-sigil-border p-4">
          <h3 className="text-xs font-medium text-sigil-muted mb-2">
            Preview: {selectedComponent}
          </h3>
          <div className="sigil-card p-4 flex items-center justify-center min-h-[100px]">
            <ComponentPreview name={selectedComponent} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Component Preview
 *
 * Renders a preview of the selected component with current tensions.
 */
function ComponentPreview({ name }: { name: string }) {
  switch (name) {
    case 'Button':
      return (
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-sigil bg-sigil-accent text-white text-sm">
            Primary
          </button>
          <button className="px-4 py-2 rounded-sigil border border-sigil-border text-sigil-text text-sm">
            Secondary
          </button>
        </div>
      );

    case 'Card':
      return (
        <div className="sigil-card p-4 max-w-[200px]">
          <div className="text-sm font-medium">Card Title</div>
          <div className="text-xs text-sigil-muted mt-1">
            Card content with current tensions.
          </div>
        </div>
      );

    case 'Input':
      return (
        <input
          type="text"
          placeholder="Input preview"
          className="px-3 py-2 rounded-sigil border border-sigil-border bg-sigil-bg text-sigil-text text-sm"
        />
      );

    case 'Badge':
      return (
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded-sigil bg-sigil-success/20 text-sigil-success text-xs">
            Success
          </span>
          <span className="px-2 py-1 rounded-sigil bg-sigil-warning/20 text-sigil-warning text-xs">
            Warning
          </span>
        </div>
      );

    default:
      return (
        <div className="text-sigil-muted text-sm">
          Preview not available for {name}
        </div>
      );
  }
}
