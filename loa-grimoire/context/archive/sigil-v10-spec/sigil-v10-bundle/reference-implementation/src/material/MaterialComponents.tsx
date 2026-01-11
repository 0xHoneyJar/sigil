/**
 * Sigil Soul Engine v10 — Material Components
 * 
 * Components that respect Material physics.
 * Glass refracts. Clay has weight. Machinery clicks.
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  useRef, 
  useEffect,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from 'react';
import { MaterialType, getMaterial, MaterialPhysics } from './MaterialCore';

// ═══════════════════════════════════════════════════════════════════════════
// MATERIAL CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

interface MaterialContextValue {
  material: MaterialType;
  physics: MaterialPhysics;
  setMaterial: (material: MaterialType) => void;
}

const MaterialContext = createContext<MaterialContextValue | null>(null);

export function MaterialProvider({ 
  children,
  defaultMaterial = 'clay',
}: { 
  children: ReactNode;
  defaultMaterial?: MaterialType;
}) {
  const [material, setMaterial] = useState<MaterialType>(defaultMaterial);
  const physics = getMaterial(material);
  
  return (
    <MaterialContext.Provider value={{ material, physics, setMaterial }}>
      <div 
        data-material={material}
        style={{ 
          ...physics.getSurfaceCSS(),
          minHeight: '100%',
        }}
      >
        {children}
      </div>
    </MaterialContext.Provider>
  );
}

export function useMaterial(): MaterialContextValue {
  const context = useContext(MaterialContext);
  if (!context) {
    // Return default if not in provider
    return {
      material: 'clay',
      physics: getMaterial('clay'),
      setMaterial: () => {},
    };
  }
  return context;
}

// ═══════════════════════════════════════════════════════════════════════════
// MATERIAL BUTTON
// ═══════════════════════════════════════════════════════════════════════════

interface MaterialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  materialOverride?: MaterialType;
}

export function MaterialButton({ 
  children, 
  variant = 'primary',
  size = 'md',
  materialOverride,
  style,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  ...props 
}: MaterialButtonProps) {
  const { physics, material } = useMaterial();
  const activePhysics = materialOverride ? getMaterial(materialOverride) : physics;
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Apply entrance animation on mount
  useEffect(() => {
    if (buttonRef.current) {
      const animation = activePhysics.getEntranceAnimation();
      buttonRef.current.animate(animation.keyframes, animation.options);
    }
  }, [activePhysics]);
  
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const hoverEffect = activePhysics.getHoverEffect();
    Object.assign(e.currentTarget.style, hoverEffect);
    onMouseEnter?.(e);
  };
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Reset to default surface
    const surface = activePhysics.getSurfaceCSS();
    Object.assign(e.currentTarget.style, {
      transform: 'none',
      boxShadow: activePhysics.getShadowCSS(),
    });
    onMouseLeave?.(e);
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    const activeEffect = activePhysics.getActiveEffect();
    Object.assign(e.currentTarget.style, activeEffect);
    onMouseDown?.(e);
  };
  
  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    const hoverEffect = activePhysics.getHoverEffect();
    Object.assign(e.currentTarget.style, hoverEffect);
    onMouseUp?.(e);
  };
  
  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '16px' },
  };
  
  return (
    <button
      ref={buttonRef}
      {...props}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        ...activePhysics.getSurfaceCSS(),
        boxShadow: activePhysics.getShadowCSS(),
        ...sizeStyles[size],
        cursor: 'pointer',
        fontWeight: 500,
        ...style,
      }}
      data-material={materialOverride || material}
      data-variant={variant}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MATERIAL CARD
// ═══════════════════════════════════════════════════════════════════════════

interface MaterialCardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: 'low' | 'medium' | 'high';
  materialOverride?: MaterialType;
}

export function MaterialCard({ 
  children, 
  elevation = 'medium',
  materialOverride,
  style,
  ...props 
}: MaterialCardProps) {
  const { physics, material } = useMaterial();
  const activePhysics = materialOverride ? getMaterial(materialOverride) : physics;
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Apply entrance animation on mount
  useEffect(() => {
    if (cardRef.current) {
      const animation = activePhysics.getEntranceAnimation();
      cardRef.current.animate(animation.keyframes, animation.options);
    }
  }, [activePhysics]);
  
  const elevationShadows = {
    low: activePhysics.getShadowCSS().replace(/0\.08/g, '0.04'),
    medium: activePhysics.getShadowCSS(),
    high: activePhysics.getShadowCSS().replace(/0\.08/g, '0.12'),
  };
  
  return (
    <div
      ref={cardRef}
      {...props}
      style={{
        ...activePhysics.getSurfaceCSS(),
        boxShadow: elevationShadows[elevation],
        padding: '20px',
        ...style,
      }}
      data-material={materialOverride || material}
      data-elevation={elevation}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MATERIAL INPUT
// ═══════════════════════════════════════════════════════════════════════════

interface MaterialInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  materialOverride?: MaterialType;
}

export function MaterialInput({ 
  materialOverride,
  style,
  ...props 
}: MaterialInputProps) {
  const { physics, material } = useMaterial();
  const activePhysics = materialOverride ? getMaterial(materialOverride) : physics;
  
  // Machinery material: no transitions
  const transitionStyle = (materialOverride || material) === 'machinery' 
    ? { transition: 'none' }
    : { transition: 'all 150ms ease' };
  
  return (
    <input
      {...props}
      style={{
        ...activePhysics.getSurfaceCSS(),
        padding: '10px 14px',
        fontSize: '14px',
        outline: 'none',
        width: '100%',
        ...transitionStyle,
        ...style,
      }}
      data-material={materialOverride || material}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVER-TICK BUTTON (For High-Stakes Actions)
// ═══════════════════════════════════════════════════════════════════════════

interface ServerTickButtonProps extends MaterialButtonProps {
  isPending: boolean;
  onAction: () => Promise<void>;
  pendingText?: string;
  successText?: string;
}

export function ServerTickButton({
  children,
  isPending,
  onAction,
  pendingText = 'Processing...',
  successText = 'Success!',
  disabled,
  ...props
}: ServerTickButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleClick = async () => {
    try {
      await onAction();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch {
      // Error handled by parent
    }
  };
  
  return (
    <MaterialButton
      {...props}
      onClick={handleClick}
      disabled={disabled || isPending}
      style={{
        ...props.style,
        opacity: isPending ? 0.7 : 1,
        cursor: isPending ? 'wait' : 'pointer',
      }}
    >
      {isPending ? (
        <span className="pending-state">
          {/* No spinner - just text for Machinery material */}
          {pendingText}
        </span>
      ) : showSuccess ? (
        <span className="success-state">
          {successText}
        </span>
      ) : (
        children
      )}
    </MaterialButton>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND PALETTE (Always Machinery Material)
// ═══════════════════════════════════════════════════════════════════════════

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Array<{
    id: string;
    label: string;
    shortcut?: string;
    onSelect: () => void;
  }>;
}

export function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );
  
  // ALWAYS use Machinery material for command palette
  const physics = getMaterial('machinery');
  
  return (
    <div 
      className="command-palette-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '20vh',
        zIndex: 9999,
      }}
    >
      <div 
        className="command-palette"
        onClick={e => e.stopPropagation()}
        style={{
          ...physics.getSurfaceCSS(),
          width: '100%',
          maxWidth: '560px',
          overflow: 'hidden',
          // NO animations - instant appearance
        }}
        data-material="machinery"
      >
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Type a command..."
          style={{
            ...physics.getSurfaceCSS(),
            width: '100%',
            padding: '16px 20px',
            fontSize: '15px',
            border: 'none',
            borderBottom: '1px solid #2A2A2A',
            outline: 'none',
            // NO transitions
            transition: 'none',
          }}
        />
        <div className="command-list" style={{ maxHeight: '320px', overflow: 'auto' }}>
          {filteredCommands.map(cmd => (
            <div
              key={cmd.id}
              onClick={() => {
                cmd.onSelect();
                onClose();
              }}
              style={{
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                // Instant hover - no transition
                transition: 'none',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span>{cmd.label}</span>
              {cmd.shortcut && (
                <kbd style={{
                  padding: '2px 6px',
                  background: '#2A2A2A',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}>
                  {cmd.shortcut}
                </kbd>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
