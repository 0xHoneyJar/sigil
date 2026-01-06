/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { SigilZone, useSigilPhysics, useServerAuthoritative } from '../core/SigilZone';
import { PHYSICS, type Material } from '../core/physics';

// Test component that displays physics values
function PhysicsDisplay() {
  const { physics, material, serverAuthoritative } = useSigilPhysics();

  return (
    <div>
      <span data-testid="material">{material}</span>
      <span data-testid="stiffness">{physics.spring.stiffness}</span>
      <span data-testid="damping">{physics.spring.damping}</span>
      <span data-testid="tap-scale">{physics.tap.scale}</span>
      <span data-testid="server-auth">{serverAuthoritative.toString()}</span>
    </div>
  );
}

describe('SigilZone', () => {
  describe('provides correct physics for each material', () => {
    const materials: Material[] = ['decisive', 'machinery', 'glass'];

    materials.forEach((material) => {
      it(`provides ${material} physics`, () => {
        render(
          <SigilZone material={material}>
            <PhysicsDisplay />
          </SigilZone>
        );

        const expected = PHYSICS[material];

        expect(screen.getByTestId('material').textContent).toBe(material);
        expect(screen.getByTestId('stiffness').textContent).toBe(
          String(expected.spring.stiffness)
        );
        expect(screen.getByTestId('damping').textContent).toBe(
          String(expected.spring.damping)
        );
        expect(screen.getByTestId('tap-scale').textContent).toBe(
          String(expected.tap.scale)
        );
      });
    });
  });

  it('sets serverAuthoritative flag correctly', () => {
    const { rerender } = render(
      <SigilZone material="decisive" serverAuthoritative>
        <PhysicsDisplay />
      </SigilZone>
    );

    expect(screen.getByTestId('server-auth').textContent).toBe('true');

    rerender(
      <SigilZone material="decisive" serverAuthoritative={false}>
        <PhysicsDisplay />
      </SigilZone>
    );

    expect(screen.getByTestId('server-auth').textContent).toBe('false');
  });

  it('provides defaults when used outside SigilZone', () => {
    render(<PhysicsDisplay />);

    // Should use default material (glass)
    expect(screen.getByTestId('material').textContent).toBe('glass');
    expect(screen.getByTestId('stiffness').textContent).toBe('200');
    expect(screen.getByTestId('damping').textContent).toBe('20');
    expect(screen.getByTestId('server-auth').textContent).toBe('false');
  });

  it('allows nested zones with override', () => {
    render(
      <SigilZone material="glass">
        <div data-testid="outer">
          <SigilZone material="decisive">
            <PhysicsDisplay />
          </SigilZone>
        </div>
      </SigilZone>
    );

    // Inner zone should override with decisive
    expect(screen.getByTestId('material').textContent).toBe('decisive');
    expect(screen.getByTestId('stiffness').textContent).toBe('180');
  });
});

describe('useServerAuthoritative', () => {
  function AuthDisplay() {
    const isServerAuth = useServerAuthoritative();
    return <span data-testid="auth">{isServerAuth.toString()}</span>;
  }

  it('returns true in serverAuthoritative zone', () => {
    render(
      <SigilZone material="decisive" serverAuthoritative>
        <AuthDisplay />
      </SigilZone>
    );

    expect(screen.getByTestId('auth').textContent).toBe('true');
  });

  it('returns false when not set', () => {
    render(
      <SigilZone material="decisive">
        <AuthDisplay />
      </SigilZone>
    );

    expect(screen.getByTestId('auth').textContent).toBe('false');
  });
});

describe('physics token values', () => {
  it('decisive has correct values for critical actions', () => {
    expect(PHYSICS.decisive.spring.stiffness).toBe(180);
    expect(PHYSICS.decisive.spring.damping).toBe(12);
    expect(PHYSICS.decisive.tap.scale).toBe(0.98);
    expect(PHYSICS.decisive.minPendingTime).toBe(600);
    expect(PHYSICS.decisive.feel).toContain('deliberate');
  });

  it('machinery has correct values for admin actions', () => {
    expect(PHYSICS.machinery.spring.stiffness).toBe(400);
    expect(PHYSICS.machinery.spring.damping).toBe(30);
    expect(PHYSICS.machinery.tap.scale).toBe(0.96);
    expect(PHYSICS.machinery.minPendingTime).toBe(0);
    expect(PHYSICS.machinery.feel).toContain('efficient');
  });

  it('glass has correct values for marketing', () => {
    expect(PHYSICS.glass.spring.stiffness).toBe(200);
    expect(PHYSICS.glass.spring.damping).toBe(20);
    expect(PHYSICS.glass.tap.scale).toBe(0.97);
    expect(PHYSICS.glass.minPendingTime).toBe(200);
    expect(PHYSICS.glass.feel).toContain('delightful');
  });
});
