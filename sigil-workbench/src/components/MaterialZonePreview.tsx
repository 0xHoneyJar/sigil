/**
 * Material Zone Preview Component
 *
 * Preview panel showing how components look with current tensions.
 */

import { clsx } from 'clsx';
import type { TensionState, ZoneConfig, MaterialType } from '../lib/types';

interface MaterialZonePreviewProps {
  tensions: TensionState;
  zones: ZoneConfig[];
  activeZone: string | null;
  onZoneSelect: (zone: string | null) => void;
}

const MATERIAL_STYLES: Record<
  MaterialType,
  { bg: string; border: string; shadow: string; description: string }
> = {
  glass: {
    bg: 'bg-white/5 backdrop-blur-md',
    border: 'border-white/10',
    shadow: 'shadow-none',
    description: 'Light, translucent. Blur and refraction.',
  },
  clay: {
    bg: 'bg-sigil-surface',
    border: 'border-sigil-border',
    shadow: 'shadow-lg shadow-black/10',
    description: 'Warm, tactile. Soft shadows and spring motion.',
  },
  machinery: {
    bg: 'bg-sigil-bg',
    border: 'border-sigil-border',
    shadow: 'shadow-none',
    description: 'Instant, precise. Zero transitions.',
  },
};

export function MaterialZonePreview({
  tensions,
  zones,
  activeZone,
  onZoneSelect,
}: MaterialZonePreviewProps) {
  const selectedZone = zones.find((z) => z.name === activeZone) || zones[0];
  const materialStyle = MATERIAL_STYLES[selectedZone?.material || 'clay'];

  return (
    <div className="space-y-6">
      {/* Zone Tabs */}
      <div className="flex items-center gap-2">
        {zones.map((zone) => (
          <button
            key={zone.name}
            onClick={() => onZoneSelect(zone.name)}
            className={clsx(
              'px-3 py-1.5 rounded-md text-sm transition-colors',
              activeZone === zone.name || (!activeZone && zone === zones[0])
                ? 'bg-sigil-accent text-white'
                : 'bg-sigil-surface text-sigil-muted hover:text-sigil-text border border-sigil-border'
            )}
          >
            <span className="capitalize">{zone.name}</span>
            <span className="ml-2 text-xs opacity-70">({zone.material})</span>
          </button>
        ))}
      </div>

      {/* Material Info */}
      <div className="flex items-center gap-3 text-sm text-sigil-muted">
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              'w-3 h-3 rounded-full',
              selectedZone?.material === 'glass' && 'bg-blue-400',
              selectedZone?.material === 'clay' && 'bg-amber-400',
              selectedZone?.material === 'machinery' && 'bg-slate-400'
            )}
          />
          <span className="capitalize">{selectedZone?.material} Material</span>
        </div>
        <span className="text-sigil-border">|</span>
        <span>{materialStyle.description}</span>
      </div>

      {/* Preview Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Button Preview */}
        <PreviewCard title="Button" material={selectedZone?.material || 'clay'}>
          <div className="flex gap-3">
            <button
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-sigil transition-all',
                'bg-sigil-accent text-white hover:bg-sigil-accent/90'
              )}
            >
              Primary
            </button>
            <button
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-sigil transition-all',
                'border border-sigil-border text-sigil-text hover:bg-sigil-surface'
              )}
            >
              Secondary
            </button>
          </div>
        </PreviewCard>

        {/* Card Preview */}
        <PreviewCard title="Card" material={selectedZone?.material || 'clay'}>
          <div
            className={clsx(
              'p-4 rounded-sigil border transition-all',
              materialStyle.bg,
              materialStyle.border,
              materialStyle.shadow
            )}
          >
            <div className="text-sm font-medium text-sigil-text mb-1">
              Card Title
            </div>
            <div className="text-xs text-sigil-muted">
              Card content with current tension settings applied.
            </div>
          </div>
        </PreviewCard>

        {/* Input Preview */}
        <PreviewCard title="Input" material={selectedZone?.material || 'clay'}>
          <input
            type="text"
            placeholder="Enter something..."
            className={clsx(
              'w-full px-3 py-2 text-sm rounded-sigil border transition-all',
              'bg-sigil-bg border-sigil-border text-sigil-text',
              'placeholder:text-sigil-muted focus:border-sigil-accent focus:outline-none'
            )}
          />
        </PreviewCard>

        {/* Badge Preview */}
        <PreviewCard title="Badges" material={selectedZone?.material || 'clay'}>
          <div className="flex gap-2 flex-wrap">
            <span
              className={clsx(
                'px-2 py-1 text-xs font-medium rounded-sigil',
                'bg-sigil-success/20 text-sigil-success'
              )}
            >
              Success
            </span>
            <span
              className={clsx(
                'px-2 py-1 text-xs font-medium rounded-sigil',
                'bg-sigil-warning/20 text-sigil-warning'
              )}
            >
              Warning
            </span>
            <span
              className={clsx(
                'px-2 py-1 text-xs font-medium rounded-sigil',
                'bg-sigil-danger/20 text-sigil-danger'
              )}
            >
              Error
            </span>
          </div>
        </PreviewCard>
      </div>

      {/* Animation Preview */}
      <div className="border-t border-sigil-border pt-6">
        <h3 className="text-sm font-semibold text-sigil-text mb-4">
          Animation Preview
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <AnimationDemo
            label="Entrance"
            tensions={tensions}
            animation="entrance"
          />
          <AnimationDemo label="Hover" tensions={tensions} animation="hover" />
          <AnimationDemo label="Press" tensions={tensions} animation="press" />
        </div>
      </div>

      {/* Tension Summary */}
      <div className="border-t border-sigil-border pt-6">
        <h3 className="text-sm font-semibold text-sigil-text mb-4">
          Applied Values
        </h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <TensionSummary
            label="Border Radius"
            value={`${Math.round(4 + tensions.playfulness * 0.12)}px`}
          />
          <TensionSummary
            label="Shadow Blur"
            value={`${Math.round(4 + tensions.weight * 0.2)}px`}
          />
          <TensionSummary
            label="Gap"
            value={`${Math.round(24 - tensions.density * 0.12)}px`}
          />
          <TensionSummary
            label="Transition"
            value={`${Math.round(300 - tensions.speed * 2.8)}ms`}
          />
        </div>
      </div>
    </div>
  );
}

function PreviewCard({
  title,
  children,
}: {
  title: string;
  material: MaterialType;
  children: React.ReactNode;
}) {
  return (
    <div className="sigil-card p-4">
      <div className="text-xs font-medium text-sigil-muted uppercase tracking-wider mb-3">
        {title}
      </div>
      {children}
    </div>
  );
}

function AnimationDemo({
  label,
  tensions,
  animation,
}: {
  label: string;
  tensions: TensionState;
  animation: 'entrance' | 'hover' | 'press';
}) {
  const duration = Math.round(300 - tensions.speed * 2.8);
  const bounce = tensions.playfulness > 70 ? 1.1 : 1.0;

  return (
    <div className="sigil-card p-4 text-center">
      <div className="text-xs text-sigil-muted mb-3">{label}</div>
      <div
        className={clsx(
          'w-12 h-12 mx-auto rounded-sigil bg-sigil-accent',
          animation === 'entrance' && 'animate-bounce',
          animation === 'hover' && 'hover:scale-105',
          animation === 'press' && 'active:scale-95'
        )}
        style={{
          transitionDuration: `${duration}ms`,
          '--bounce-scale': bounce,
        } as React.CSSProperties}
      />
      <div className="text-xs text-sigil-muted mt-2">{duration}ms</div>
    </div>
  );
}

function TensionSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="sigil-card p-3">
      <div className="text-xs text-sigil-muted mb-1">{label}</div>
      <div className="text-lg font-mono text-sigil-text">{value}</div>
    </div>
  );
}
